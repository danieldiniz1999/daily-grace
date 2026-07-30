import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";

function getPlanName(payload: Record<string, unknown>): string {
  const candidates = [
    payload.product_name,
    payload.plan_name,
    payload.subscription_name,
    payload.subscription_type,
    payload.product_id,
    (payload.product as Record<string, unknown>)?.name,
    (payload.product as Record<string, unknown>)?.plan_name,
    (payload.plan as Record<string, unknown>)?.name,
    (payload.subscription as Record<string, unknown>)?.plan_name,
    (payload.subscription as Record<string, unknown>)?.name,
    (payload.offer as Record<string, unknown>)?.name,
    (payload.Product as Record<string, unknown>)?.name,
    (payload.Plan as Record<string, unknown>)?.name,
    (payload.Subscription as Record<string, unknown>)?.name,
    (payload.Subscription as Record<string, unknown>)?.plan_name,
    payload.ProductName,
    payload.PlanName,
  ];
  for (const c of candidates) {
    const val = typeof c === "string" ? c : null;
    if (val && val.trim()) return val.trim();
  }
  return "";
}

function detectBillingPeriod(name: string): "monthly" | "annual" | null {
  const lower = name.toLowerCase();
  if (lower.includes("anual") || lower.includes("annual") || lower.includes("ano")) {
    return "annual";
  }
  if (lower.includes("mensal") || lower.includes("monthly") || lower.includes("mês") || lower.includes("mes")) {
    return "monthly";
  }
  return null;
}

/**
 * Webhook da Kiwify.
 * Configure a URL na Kiwify e salve o token do webhook em KIWIFY_WEBHOOK_TOKEN.
 */
export const Route = createFileRoute("/api/public/kiwify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.KIWIFY_WEBHOOK_TOKEN;
        if (!token) {
          console.error("[kiwify] KIWIFY_WEBHOOK_TOKEN não configurado");
          return new Response("Webhook não configurado", { status: 500 });
        }

        const url = new URL(request.url);
        const signature = url.searchParams.get("signature") ?? "";
        const body = await request.text();

        const expected = createHmac("sha1", token).update(body).digest("hex");
        const sig = Buffer.from(signature);
        const exp = Buffer.from(expected);
        if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
          return new Response("Assinatura inválida", { status: 401 });
        }

        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(body);
        } catch {
          return new Response("JSON inválido", { status: 400 });
        }

        const customer = (payload.Customer ?? payload.customer ?? {}) as Record<string, unknown>;
        const email = String(customer.email ?? customer.Email ?? "")
          .trim()
          .toLowerCase();
        const orderStatus = String(payload.order_status ?? payload.status ?? "").toLowerCase();
        const webhookEvent = String(payload.webhook_event_type ?? "").toLowerCase();
        const orderId = String(payload.order_id ?? payload.id ?? "");
        const name = String(customer.full_name ?? customer.name ?? "") || null;

        if (!email) return new Response("Sem e-mail no payload", { status: 400 });

        const paidEvents = ["order_approved", "subscription_renewed", "billet_created"];
        const isPaid =
          orderStatus === "paid" ||
          orderStatus === "approved" ||
          paidEvents.includes(webhookEvent) ||
          webhookEvent === "order_approved";
        const isCanceled = ["refunded", "chargedback", "canceled", "cancelled"].includes(
          orderStatus,
        );
        const isLate = ["subscription_late", "billet_expired", "waiting_payment"].includes(
          webhookEvent || orderStatus,
        );

        const status = isCanceled ? "canceled" : isLate ? "past_due" : isPaid ? "active" : null;
        if (!status) return new Response("ok (evento ignorado)");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const billingPeriod = detectBillingPeriod(getPlanName(payload));
        const paidAt =
          payload.paid_at ??
          payload.payment_date ??
          payload.purchase_date ??
          payload.created_at ??
          payload.createdAt ??
          null;
        const startedAt = typeof paidAt === "string" && !isNaN(Date.parse(paidAt))
          ? new Date(paidAt)
          : new Date();

        // Encontra ou cria a usuária pelo e-mail
        let userId: string | null = null;
        const { data: existingProfile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (existingProfile) {
          userId = existingProfile.id;
        } else {
          // Busca na Auth também para evitar duplicar usuária
          const { data: userList } = await supabaseAdmin.auth.admin.listUsers({
            filter: `email:eq:${email}`,
          });
          const existingUser = userList?.users?.[0];

          if (existingUser) {
            userId = existingUser.id;
            if (name) {
              await supabaseAdmin.auth.admin.updateUserById(userId, {
                user_metadata: { full_name: name },
              });
            }
          } else {
            const tempPassword = randomBytes(24).toString("hex");
            const { data: created, error: createError } =
              await supabaseAdmin.auth.admin.createUser({
                email,
                password: tempPassword,
                email_confirm: true,
                user_metadata: { full_name: name },
              });
            if (createError || !created?.user) {
              console.error("[kiwify] falha ao criar usuária", createError);
              return new Response("Falha ao criar usuária", { status: 500 });
            }
            userId = created.user.id;
          }

          // Cria o perfil se ainda não existir
          const { data: profileCheck } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("id", userId)
            .maybeSingle();
          if (!profileCheck) {
            const { error: profileError } = await supabaseAdmin.from("profiles").insert({
              id: userId,
              email,
              full_name: name,
            });
            if (profileError) {
              console.error("[kiwify] erro ao criar perfil", profileError);
              // não falha o webhook por conta do perfil, mas loga
            }
          }
        }

        // Calcula o fim do período
        let currentPeriodEnd: string | null = null;
        if (billingPeriod && status === "active") {
          const endDate = new Date(startedAt);
          if (billingPeriod === "annual") {
            endDate.setFullYear(endDate.getFullYear() + 1);
          } else {
            endDate.setMonth(endDate.getMonth() + 1);
          }
          currentPeriodEnd = endDate.toISOString();
        }

        // Se for renovação, estende o fim do período atual
        if (webhookEvent === "subscription_renewed") {
          const { data: currentSub } = await supabaseAdmin
            .from("subscriptions")
            .select("current_period_end, billing_period")
            .eq("user_id", userId)
            .maybeSingle();
          const baseDate = currentSub?.current_period_end
            ? new Date(currentSub.current_period_end)
            : startedAt;
          const period = currentSub?.billing_period ?? billingPeriod ?? "monthly";
          const endDate = new Date(baseDate);
          if (period === "annual") endDate.setFullYear(endDate.getFullYear() + 1);
          else endDate.setMonth(endDate.getMonth() + 1);
          currentPeriodEnd = endDate.toISOString();
        }

        const { error } = await supabaseAdmin.from("subscriptions").upsert(
          {
            user_id: userId!,
            status,
            started_at: startedAt.toISOString(),
            billing_period: billingPeriod,
            current_period_end: currentPeriodEnd,
            kiwify_order_id: orderId || null,
            kiwify_customer_email: email,
          },
          { onConflict: "user_id" },
        );

        if (error) {
          console.error("[kiwify] erro ao salvar assinatura", error);
          return new Response("Erro ao salvar assinatura", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});

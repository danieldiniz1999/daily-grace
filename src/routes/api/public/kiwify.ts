import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

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

        // Encontra ou cria a usuária pelo e-mail da compra
        let userId: string | null = null;
        const { data: existing } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (existing) {
          userId = existing.id;
        } else {
          const { data: invited, error: inviteError } =
            await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
              data: { full_name: name },
            });
          if (inviteError || !invited?.user) {
            console.error("[kiwify] falha ao criar usuária", inviteError);
            return new Response("Falha ao criar usuária", { status: 500 });
          }
          userId = invited.user.id;
        }

        const { error } = await supabaseAdmin.from("subscriptions").upsert(
          {
            user_id: userId!,
            status,
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

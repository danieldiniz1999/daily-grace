import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";



function obj(v: unknown): Record<string, unknown> {
  return (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
}

function getPlanName(payload: Record<string, unknown>): string {
  const sub = obj(payload.Subscription ?? payload.subscription);
  const subPlan = obj(sub.plan ?? sub.Plan);
  const candidates = [
    subPlan.name,
    subPlan.plan_name,
    subPlan.frequency,
    sub.plan_name,
    sub.name,
    sub.frequency,
    payload.product_name,
    payload.plan_name,
    payload.subscription_name,
    payload.subscription_type,
    obj(payload.product).name,
    obj(payload.product).plan_name,
    obj(payload.plan).name,
    obj(payload.offer).name,
    obj(payload.Product).name,
    obj(payload.Plan).name,
    payload.ProductName,
    payload.PlanName,
    payload.product_id,
  ];
  const texts = candidates
    .map((c) => (typeof c === "string" ? c.trim() : ""))
    .filter(Boolean);
  return texts.join(" | ");
}

/** Coleta todos os identificadores de produto presentes no payload. */
function getProductIds(payload: Record<string, unknown>): string[] {
  const values = [
    payload.product_id,
    payload.ProductId,
    obj(payload.product).id,
    obj(payload.Product).id,
    obj(payload.Product).product_id,
    obj(obj(payload.Subscription ?? payload.subscription).product).id,
    obj(payload.Commissions).product_id,
  ];
  return values.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean);
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

        // Só processa vendas do produto Daily Grace
        const expectedProductId = process.env.KIWIFY_PRODUCT_ID?.trim();
        if (expectedProductId) {
          const ids = getProductIds(payload);
          if (ids.length > 0 && !ids.includes(expectedProductId)) {
            console.log("[kiwify] evento de outro produto ignorado", ids);
            return new Response("ok (outro produto)");
          }
        }

        const paidEvents = ["order_approved", "subscription_renewed"];
        const isPaid =
          orderStatus === "paid" ||
          orderStatus === "approved" ||
          paidEvents.includes(webhookEvent) ||
          webhookEvent === "order_approved";
        const isCanceled = ["refunded", "chargedback", "canceled", "cancelled"].includes(
          orderStatus,
        );
        const isLate = [
          "subscription_late",
          "billet_expired",
          "waiting_payment",
          "billet_created",
          "pix_created",
        ].includes(webhookEvent || orderStatus);

        const status = isCanceled ? "canceled" : isLate ? "past_due" : isPaid ? "active" : null;
        if (!status) return new Response("ok (evento ignorado)");

        const paidAt =
          payload.paid_at ??
          payload.payment_date ??
          payload.purchase_date ??
          payload.created_at ??
          payload.createdAt ??
          null;
        const startedAt =
          typeof paidAt === "string" && !isNaN(Date.parse(paidAt))
            ? new Date(paidAt)
            : new Date();

        const { provisionSubscription } = await import("@/lib/subscription.server");

        try {
          await provisionSubscription({
            email,
            name,
            status,
            startedAt,
            planName: getPlanName(payload),
            orderId: orderId || null,
            renew: webhookEvent === "subscription_renewed",
          });
        } catch (e) {
          console.error("[kiwify] erro ao salvar assinatura", e);
          return new Response("Erro ao salvar assinatura", { status: 500 });
        }

        return new Response("ok");

      },
    },
  },
});

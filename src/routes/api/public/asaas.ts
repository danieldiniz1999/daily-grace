import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";

/**
 * Webhook do Asaas (Pagamentos e Assinaturas).
 * Configure a URL no Asaas: https://seu-dominio/api/public/asaas
 * e defina o token em ASAAS_WEBHOOK_TOKEN (se configurado no Asaas).
 */
export const Route = createFileRoute("/api/public/asaas")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const configuredToken = process.env.ASAAS_WEBHOOK_TOKEN?.trim();

        // Se o token estiver configurado, valida a assinatura/header
        if (configuredToken) {
          const authHeader = request.headers.get("asaas-access-token") ?? "";
          const headerBuf = Buffer.from(authHeader);
          const expBuf = Buffer.from(configuredToken);

          if (
            headerBuf.length !== expBuf.length ||
            !timingSafeEqual(headerBuf, expBuf)
          ) {
            return new Response("Assinatura Asaas inválida", { status: 401 });
          }
        }

        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response("JSON inválido", { status: 400 });
        }

        const event = String(body.event || "").toUpperCase();
        const payment = body.payment || {};
        const customerId = payment.customer || "";

        const { asaasEventToStatus, getAsaasCustomer } = await import("@/lib/asaas.server");
        const status = asaasEventToStatus(event);

        if (!status) {
          return new Response("Evento Asaas ignorado", { status: 200 });
        }

        let email = String(payment.customerEmail || "").trim().toLowerCase();
        let name: string | null = payment.customerName || null;
        let phone: string | null = null;

        // Se o payload não tiver os dados completos do cliente, busca via API do Asaas
        if ((!email || !phone) && customerId) {
          const customerData = await getAsaasCustomer(customerId);
          if (customerData) {
            if (!email) email = customerData.email.trim().toLowerCase();
            if (!name) name = customerData.name || null;
            phone = customerData.mobilePhone || customerData.phone || null;
          }
        }

        if (!email) {
          return new Response("Sem e-mail no payload ou cadastro do Asaas", { status: 400 });
        }

        const { provisionSubscription } = await import("@/lib/subscription.server");

        try {
          const result = await provisionSubscription({
            email,
            name,
            status,
            startedAt: payment.paymentDate ? new Date(payment.paymentDate) : new Date(),
            planName: payment.description || "Assinatura Daily Grace (Asaas)",
            orderId: payment.id || null,
          });

          // Se a conta for nova e tiver telefone, envia boas-vindas pelo WhatsApp via Evolution API
          if (result.created && phone) {
            try {
              const { sendWelcomeWhatsApp } = await import("@/lib/evolution.server");
              await sendWelcomeWhatsApp({
                phone,
                name,
                email,
              });
            } catch (whatsErr) {
              console.warn("[asaas] Aviso: falha ao enviar WhatsApp de boas-vindas:", whatsErr);
            }
          }
        } catch (e) {
          console.error("[asaas] Erro ao salvar assinatura:", e);
          return new Response("Erro ao salvar assinatura", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});

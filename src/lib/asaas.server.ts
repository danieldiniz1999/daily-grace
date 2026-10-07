/**
 * Integração com Asaas (Pagamentos, Pix, Cartão e Assinaturas)
 */

function getAsaasConfig() {
  const apiKey = (process.env.ASAAS_API_KEY || "").trim();
  const apiUrl = (process.env.ASAAS_API_URL || "https://api.asaas.com/v3").trim().replace(/\/+$/, "");
  const webhookToken = (process.env.ASAAS_WEBHOOK_TOKEN || "").trim();
  return { apiKey, apiUrl, webhookToken };
}

/** Busca dados de cliente no Asaas pelo ID do cliente */
export async function getAsaasCustomer(customerId: string): Promise<{
  id: string;
  name: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
} | null> {
  const { apiKey, apiUrl } = getAsaasConfig();
  if (!apiKey) return null;

  try {
    const res = await fetch(`${apiUrl}/customers/${customerId}`, {
      headers: {
        access_token: apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("[asaas] Erro ao buscar cliente:", err);
    return null;
  }
}

/** Mapeia eventos de pagamento do Asaas para o status da assinatura no Daily Grace */
export function asaasEventToStatus(event: string): "active" | "past_due" | "canceled" | null {
  const ev = event.toUpperCase();
  if (
    ev === "PAYMENT_RECEIVED" ||
    ev === "PAYMENT_CONFIRMED" ||
    ev === "PAYMENT_CREATED" ||
    ev === "PAYMENT_UPDATED"
  ) {
    return "active";
  }

  if (ev === "PAYMENT_OVERDUE") {
    return "past_due";
  }

  if (
    ev === "PAYMENT_DELETED" ||
    ev === "PAYMENT_REFUNDED" ||
    ev === "PAYMENT_CHARGEBACK_REQUESTED" ||
    ev === "PAYMENT_CHARGEBACK_DISPUTE"
  ) {
    return "canceled";
  }

  return null;
}

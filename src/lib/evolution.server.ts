/**
 * Integração com Evolution API (WhatsApp)
 * Permite envio de mensagens de texto e boas-vindas no WhatsApp.
 */

function getEvolutionConfig() {
  const apiUrl = (process.env.EVOLUTION_API_URL || "").trim().replace(/\/+$/, "");
  const apiKey = (process.env.EVOLUTION_API_KEY || "").trim();
  const instance = (process.env.EVOLUTION_INSTANCE_NAME || "").trim();
  return { apiUrl, apiKey, instance };
}

/** Formata número de telefone para o padrão WhatsApp Brasil (ex: 5511999999999) */
export function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  // Se começar com 55 e tiver 12 ou 13 dígitos, já tem o DDI
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }
  // Se tiver 10 ou 11 dígitos (DDD + número), adiciona 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

export async function sendWhatsAppMessage(params: {
  phone: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  const { apiUrl, apiKey, instance } = getEvolutionConfig();

  if (!apiUrl || !apiKey || !instance) {
    console.warn("[evolution] Evolution API não configurada (EVOLUTION_API_URL, EVOLUTION_API_KEY ou EVOLUTION_INSTANCE_NAME ausentes).");
    return { success: false, error: "evolution_not_configured" };
  }

  const cleanNumber = formatWhatsAppNumber(params.phone);
  if (!cleanNumber) {
    return { success: false, error: "invalid_phone" };
  }

  const endpoint = `${apiUrl}/message/sendText/${instance}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: cleanNumber,
        text: params.message,
        options: {
          delay: 1200,
          presence: "composing",
          linkPreview: false,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[evolution] Falha ao enviar WhatsApp (${res.status}):`, errText);
      return { success: false, error: `${res.status}: ${errText}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[evolution] Erro de conexão com a Evolution API:", err?.message || err);
    return { success: false, error: err?.message || "connection_error" };
  }
}

/** Mensagem de boas-vindas e entrega de acesso via WhatsApp */
export async function sendWelcomeWhatsApp(params: {
  phone: string;
  name?: string | null;
  email: string;
  password?: string | null;
}) {
  const firstName = params.name ? params.name.split(" ")[0] : "amada";
  const loginUrl = process.env.APP_LOGIN_URL || "https://dailygrace.halexiabrandao.site/auth";

  let msg = `Olá, ${firstName}! Seja muito bem-vinda ao *Daily Grace* 💜✨\n\n`;
  msg += `Sua assinatura foi confirmada com sucesso e seus devocionais diários já estão liberados.\n\n`;
  msg += `📲 *Seus dados de acesso:*\n`;
  msg += `• *E-mail:* ${params.email}\n`;
  if (params.password) {
    msg += `• *Senha provisória:* ${params.password}\n`;
  }
  msg += `\n🔗 *Acesse o app por aqui:* ${loginUrl}\n\n`;
  msg += `Que o Senhor abençoe ricamente o seu tempo com Ele a cada manhã! 🙏🌸`;

  return sendWhatsAppMessage({
    phone: params.phone,
    message: msg,
  });
}

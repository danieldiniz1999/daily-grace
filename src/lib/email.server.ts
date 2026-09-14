const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

/** Remetente. Precisa ser um domínio verificado na Resend. */
function fromAddress() {
  return process.env.RESEND_FROM || "Daily Grace <acesso@halexiabrandao.site>";
}

const BRAND = {
  purple: "#A740C4",
  light: "#CB6CE6",
  cream: "#FBFFC1",
};

function welcomeHtml(params: { name?: string | null; email: string; password: string; loginUrl: string }) {
  const firstName = params.name?.split(" ")[0] ?? "";
  const serif = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
  const sans = "'Karla', Arial, Helvetica, sans-serif";
  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Seu acesso ao Daily Grace</title></head>
<body style="margin:0;padding:0;background:#f7f2fa;font-family:${sans};color:#3a2b40;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Sua assinatura foi confirmada — seus devocionais já estão liberados 💜</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f2fa;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(167,64,196,0.14);">

        <!-- Cabeçalho -->
        <tr><td style="background:${BRAND.purple};background-image:linear-gradient(135deg,${BRAND.purple} 0%,${BRAND.light} 100%);padding:44px 32px 38px;text-align:center;">
          <div style="font-family:${serif};font-size:13px;letter-spacing:5px;text-transform:uppercase;color:${BRAND.cream};">Bem-vinda ao</div>
          <div style="font-family:${serif};font-size:44px;line-height:1.1;color:#ffffff;margin:8px 0 10px;font-weight:600;">Daily Grace</div>
          <div style="display:inline-block;height:1px;width:56px;background:${BRAND.cream};opacity:.7;"></div>
          <div style="font-family:${sans};font-size:13px;color:#ffffff;opacity:.92;margin-top:14px;letter-spacing:1px;">Um encontro com Deus todos os dias</div>
        </td></tr>

        <!-- Versículo -->
        <tr><td style="background:${BRAND.cream};padding:20px 32px;text-align:center;">
          <div style="font-family:${serif};font-size:19px;font-style:italic;color:#6b2b80;line-height:1.5;">“As misericórdias do Senhor se renovam a cada manhã.”</div>
          <div style="font-family:${sans};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9a6aa8;margin-top:8px;">Lamentações 3:23</div>
        </td></tr>

        <!-- Corpo -->
        <tr><td style="padding:34px 32px 8px;">
          <h1 style="font-family:${serif};font-size:27px;margin:0 0 14px;color:${BRAND.purple};font-weight:600;">Que alegria ter você aqui${firstName ? `, ${firstName}` : ""}!</h1>
          <p style="font-size:15px;line-height:1.7;margin:0 0 26px;color:#54455a;">
            Sua assinatura foi confirmada e seu acesso já está liberado.
            Guarde com carinho os seus dados de entrada:
          </p>

          <!-- Credenciais -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e3f6;border-radius:18px;background:#fdfaff;">
            <tr><td style="padding:22px 24px;">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a996b0;">E-mail</div>
              <div style="font-size:15px;color:#3a2b40;margin:4px 0 18px;word-break:break-all;">${params.email}</div>
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a996b0;">Senha</div>
              <div style="font-family:'Courier New',monospace;font-size:21px;letter-spacing:1px;color:${BRAND.purple};margin-top:6px;font-weight:bold;">${params.password}</div>
            </td></tr>
          </table>

          <!-- CTA -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 6px;">
            <tr><td align="center">
              <a href="${params.loginUrl}" style="display:inline-block;background:${BRAND.purple};color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:999px;font-size:15px;font-weight:bold;letter-spacing:.5px;box-shadow:0 8px 20px rgba(167,64,196,0.32);">Acessar meus devocionais</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Como funciona -->
        <tr><td style="padding:26px 32px 6px;">
          <div style="font-family:${serif};font-size:20px;color:${BRAND.purple};margin-bottom:14px;">Como funciona</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;color:#54455a;">
            <tr><td width="34" valign="top" style="padding-bottom:12px;"><div style="width:24px;height:24px;border-radius:999px;background:${BRAND.cream};color:${BRAND.purple};text-align:center;line-height:24px;font-size:12px;font-weight:bold;">1</div></td>
                <td style="padding-bottom:12px;">Entre com o e-mail e a senha acima.</td></tr>
            <tr><td width="34" valign="top" style="padding-bottom:12px;"><div style="width:24px;height:24px;border-radius:999px;background:${BRAND.cream};color:${BRAND.purple};text-align:center;line-height:24px;font-size:12px;font-weight:bold;">2</div></td>
                <td style="padding-bottom:12px;">Um novo devocional é liberado a cada dia.</td></tr>
            <tr><td width="34" valign="top"><div style="width:24px;height:24px;border-radius:999px;background:${BRAND.cream};color:${BRAND.purple};text-align:center;line-height:24px;font-size:12px;font-weight:bold;">3</div></td>
                <td>Os já liberados ficam sempre disponíveis para reler.</td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:24px 32px 32px;">
          <div style="height:1px;background:#f2e8f6;margin-bottom:16px;"></div>
          <p style="font-size:13px;line-height:1.7;color:#8b7b90;margin:0;">
            Essa é a sua senha definitiva. Se quiser trocar, é só entrar no app e alterar,
            ou usar a opção “Esqueci minha senha” na tela de login.
          </p>
        </td></tr>
      </table>

      <p style="font-family:${serif};font-size:13px;color:#a795ad;margin:18px 0 0;">Daily Grace · com carinho, para você 💜</p>
    </td></tr>
  </table>
</body></html>`;
}


async function sendEmail(to: string, subject: string, html: string) {
  const resendKey = process.env.RESEND_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;

  if (!resendKey) {
    console.error("[email] chave de envio ausente (RESEND_API_KEY)");
    return { sent: false, error: "missing_keys" };
  }

  const isLovableGateway = Boolean(lovableKey);
  const endpoint = isLovableGateway
    ? `${GATEWAY_URL}/emails`
    : "https://api.resend.com/emails";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (isLovableGateway) {
    headers["Authorization"] = `Bearer ${lovableKey}`;
    headers["X-Connection-Api-Key"] = resendKey;
  } else {
    headers["Authorization"] = `Bearer ${resendKey}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ from: fromAddress(), to: [to], subject, html }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[email] falha no envio [${response.status}]: ${body}`);
      return { sent: false, error: `${response.status}: ${body}` };
    }

    return { sent: true };
  } catch (err: any) {
    console.error("[email] erro ao conectar com o serviço de e-mail:", err?.message || err);
    return { sent: false, error: err?.message || "fetch_error" };
  }
}

/** E-mail de boas-vindas com os dados de acesso (senha definitiva). */
export async function sendWelcomeEmail(params: {
  email: string;
  name?: string | null;
  password: string;
}) {
  const loginUrl = process.env.APP_LOGIN_URL || "https://dailygrace.halexiabrandao.site/auth";
  return sendEmail(
    params.email,
    "Seu acesso ao Daily Grace 💜",
    welcomeHtml({ ...params, loginUrl }),
  );
}

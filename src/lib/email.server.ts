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
  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#3a2b40;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="background:${BRAND.purple};border-radius:16px 16px 0 0;padding:28px 24px;text-align:center;">
      <div style="color:#ffffff;font-size:26px;letter-spacing:1px;">Daily Grace</div>
      <div style="color:${BRAND.cream};font-size:14px;margin-top:6px;">Seu devocional diário</div>
    </div>
    <div style="border:1px solid #eee;border-top:none;border-radius:0 0 16px 16px;padding:28px 24px;">
      <h1 style="font-size:20px;margin:0 0 12px;color:${BRAND.purple};">Bem-vinda${firstName ? `, ${firstName}` : ""}! 💜</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 18px;">
        Sua assinatura foi confirmada e seu acesso já está liberado. Guarde seus dados de acesso:
      </p>
      <div style="background:${BRAND.cream};border-radius:12px;padding:18px 20px;margin:0 0 22px;">
        <p style="margin:0 0 8px;font-size:14px;"><strong>E-mail:</strong> ${params.email}</p>
        <p style="margin:0;font-size:14px;"><strong>Senha:</strong>
          <span style="font-family:monospace;font-size:16px;color:${BRAND.purple};">${params.password}</span>
        </p>
      </div>
      <p style="text-align:center;margin:0 0 24px;">
        <a href="${params.loginUrl}" style="display:inline-block;background:${BRAND.purple};color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;">Acessar meus devocionais</a>
      </p>
      <p style="font-size:13px;line-height:1.6;color:#6b5b70;margin:0;">
        Essa é a sua senha definitiva. Se quiser trocar, é só entrar no app e alterar,
        ou usar a opção “Esqueci minha senha” na tela de login.
      </p>
    </div>
    <p style="text-align:center;font-size:12px;color:#9b8fa0;margin-top:18px;">Daily Grace · com carinho, para você</p>
  </div>
</body></html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!lovableKey || !resendKey) {
    console.error("[email] chaves de envio ausentes (LOVABLE_API_KEY/RESEND_API_KEY)");
    return { sent: false, error: "missing_keys" };
  }

  const response = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
    },
    body: JSON.stringify({ from: fromAddress(), to: [to], subject, html }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[email] falha no envio [${response.status}]: ${body}`);
    return { sent: false, error: `${response.status}: ${body}` };
  }

  return { sent: true };
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

import { randomBytes } from "crypto";

import { detectBillingPeriod } from "./kiwify-plan";

export type ProvisionInput = {
  email: string;
  name?: string | null;
  status: "active" | "past_due" | "canceled";
  startedAt: Date;
  planName?: string | null;
  orderId?: string | null;
  /** Se true, estende o período atual em vez de recalcular do início. */
  renew?: boolean;
};

/**
 * Cria (ou encontra) a usuária pelo e-mail e grava/atualiza a assinatura.
 * Usado tanto pelo webhook quanto pela sincronização via API da Kiwify.
 */
export async function provisionSubscription(input: ProvisionInput) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() || null;
  const billingPeriod = detectBillingPeriod(input.planName ?? "");

  let userId: string | null = null;
  let created = false;

  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile) {
    userId = existingProfile.id;
  } else {
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const existingUser = userList?.users?.find((u) => u.email === email);

    if (existingUser) {
      userId = existingUser.id;
      if (name) {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { full_name: name },
        });
      }
    } else {
      const tempPassword = randomBytes(24).toString("hex");
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: name },
      });
      if (createError || !newUser?.user) {
        throw new Error(createError?.message ?? "Falha ao criar usuária");
      }
      userId = newUser.user.id;
      created = true;
    }

    const { data: profileCheck } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (!profileCheck) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({ id: userId, email, full_name: name });
      if (profileError) console.error("[kiwify] erro ao criar perfil", profileError);
    }
  }

  let currentPeriodEnd: string | null = null;
  if (billingPeriod && input.status === "active") {
    const endDate = new Date(input.startedAt);
    if (billingPeriod === "annual") endDate.setFullYear(endDate.getFullYear() + 1);
    else endDate.setMonth(endDate.getMonth() + 1);
    currentPeriodEnd = endDate.toISOString();
  }

  if (input.renew) {
    const { data: currentSub } = await supabaseAdmin
      .from("subscriptions")
      .select("current_period_end, billing_period")
      .eq("user_id", userId!)
      .maybeSingle();
    const baseDate = currentSub?.current_period_end
      ? new Date(currentSub.current_period_end)
      : input.startedAt;
    const period = currentSub?.billing_period ?? billingPeriod ?? "monthly";
    const endDate = new Date(baseDate);
    if (period === "annual") endDate.setFullYear(endDate.getFullYear() + 1);
    else endDate.setMonth(endDate.getMonth() + 1);
    currentPeriodEnd = endDate.toISOString();
  }

  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId!,
      status: input.status,
      started_at: input.startedAt.toISOString(),
      billing_period: billingPeriod,
      current_period_end: currentPeriodEnd,
      kiwify_order_id: input.orderId || null,
      kiwify_customer_email: email,
    },
    { onConflict: "user_id" },
  );

  if (error) throw new Error(error.message);

  return { userId: userId!, created, billingPeriod, currentPeriodEnd };
}

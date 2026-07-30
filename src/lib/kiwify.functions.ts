import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Sincroniza as compras do produto Daily Grace na Kiwify (somente admin). */
export const syncKiwifySales = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Acesso restrito à administradora.");

    const {
      listProductSales,
      saleStatusToSubscription,
      planNameFromSale,
      getProductId,
      dateWindows,
    } = await import("./kiwify.server");
    const { provisionSubscription } = await import("./subscription.server");

    if (!getProductId()) throw new Error("KIWIFY_PRODUCT_ID não configurado.");

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];
    const seen = new Set<string>();

    for (const win of dateWindows(24)) {
      for (let page = 1; page <= 20; page++) {
        const sales = await listProductSales({
          start: win.start,
          end: win.end,
          page,
          pageSize: 100,
        });
        if (sales.length === 0) break;

        for (const sale of sales) {
          const email = (sale.customer?.email ?? "").trim().toLowerCase();
          const status = saleStatusToSubscription(sale);
          if (!email || !status || seen.has(email)) {
            if (!seen.has(email)) skipped++;
            continue;
          }
          seen.add(email);

          const dateStr = sale.paid_at ?? sale.approved_date ?? sale.created_at ?? "";
          const startedAt =
            dateStr && !isNaN(Date.parse(dateStr)) ? new Date(dateStr) : new Date();

          try {
            const result = await provisionSubscription({
              email,
              name: sale.customer?.full_name ?? sale.customer?.name ?? null,
              status,
              startedAt,
              planName: planNameFromSale(sale),
              orderId: sale.order_id ?? sale.id ?? null,
            });
            if (result.created) imported++;
            else updated++;
          } catch (e) {
            errors.push(`${email}: ${e instanceof Error ? e.message : "erro"}`);
          }
        }

        if (sales.length < 100) break;
      }
    }


    return { imported, updated, skipped, errors: errors.slice(0, 10) };
  });

/** Consulta na Kiwify o status atual de uma assinante e atualiza o app. */
export const refreshKiwifyStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string }) => {
    const email = String(input?.email ?? "").trim().toLowerCase();
    if (!email.includes("@")) throw new Error("E-mail inválido.");
    return { email };
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Acesso restrito à administradora.");

    const { findSalesByEmail, saleStatusToSubscription, planNameFromSale } = await import(
      "./kiwify.server"
    );
    const { provisionSubscription } = await import("./subscription.server");

    const sales = await findSalesByEmail(data.email);
    if (sales.length === 0) {
      return { found: false, status: null as string | null };
    }

    const sale = sales[0];
    const status = saleStatusToSubscription(sale);
    if (!status) return { found: true, status: null };

    const dateStr = sale.paid_at ?? sale.approved_date ?? sale.created_at ?? "";
    const startedAt = dateStr && !isNaN(Date.parse(dateStr)) ? new Date(dateStr) : new Date();

    await provisionSubscription({
      email: data.email,
      name: sale.customer?.full_name ?? sale.customer?.name ?? null,
      status,
      startedAt,
      planName: planNameFromSale(sale),
      orderId: sale.order_id ?? sale.id ?? null,
    });

    return { found: true, status };
  });

/**
 * Cliente da API pública da Kiwify (server-only).
 * Todas as chamadas são filtradas pelo produto configurado em KIWIFY_PRODUCT_ID.
 */

const API_BASE = "https://public-api.kiwify.com/v1";

type TokenCache = { token: string; expiresAt: number };
let cache: TokenCache | null = null;

function creds() {
  const clientId = process.env.KIWIFY_CLIENT_ID;
  const clientSecret = process.env.KIWIFY_CLIENT_SECRET;
  const accountId = process.env.KIWIFY_ACCOUNT_ID;
  const productId = process.env.KIWIFY_PRODUCT_ID;
  if (!clientId || !clientSecret || !accountId) {
    throw new Error("Credenciais da Kiwify não configuradas.");
  }
  return { clientId, clientSecret, accountId, productId: productId ?? null };
}

export function getProductId(): string | null {
  return process.env.KIWIFY_PRODUCT_ID ?? null;
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cache && cache.expiresAt > now + 30_000) return cache.token;

  const { clientId, clientSecret } = creds();
  const res = await fetch(`${API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[kiwify-api] falha no token", res.status, text);
    throw new Error("Não foi possível autenticar na Kiwify.");
  }

  const data = (await res.json()) as { access_token: string; expires_in?: number };
  cache = {
    token: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600) * 1000,
  };
  return cache.token;
}

async function apiGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const { accountId } = creds();
  const token = await getAccessToken();
  const url = new URL(`${API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-kiwify-account-id": accountId,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[kiwify-api] erro", path, res.status, text);
    throw new Error(`Erro na API da Kiwify (${res.status}).`);
  }

  return (await res.json()) as T;
}

export type KiwifySale = {
  id?: string;
  order_id?: string;
  status?: string;
  created_at?: string;
  paid_at?: string;
  approved_date?: string;
  customer?: { email?: string; full_name?: string; name?: string };
  product?: { id?: string; name?: string };
  product_id?: string;
  subscription?: {
    plan?: { name?: string; frequency?: string };
    status?: string;
    next_payment?: string;
  };
};

/** Lista vendas do produto Daily Grace (paginado). */
export async function listProductSales(opts: { page?: number; pageSize?: number } = {}) {
  const { productId } = creds();
  const data = await apiGet<{ data?: KiwifySale[]; pagination?: unknown }>("/sales", {
    product_id: productId ?? "",
    page_number: String(opts.page ?? 1),
    page_size: String(opts.pageSize ?? 100),
  });
  const list = Array.isArray(data?.data) ? data.data : [];
  return productId ? list.filter((s) => saleBelongsToProduct(s, productId)) : list;
}

/** Busca as vendas de um e-mail específico dentro do produto. */
export async function findSalesByEmail(email: string) {
  const { productId } = creds();
  const data = await apiGet<{ data?: KiwifySale[] }>("/sales", {
    product_id: productId ?? "",
    email,
    page_size: "20",
  });
  const list = Array.isArray(data?.data) ? data.data : [];
  const filtered = productId ? list.filter((s) => saleBelongsToProduct(s, productId)) : list;
  return filtered.filter(
    (s) => (s.customer?.email ?? "").trim().toLowerCase() === email.trim().toLowerCase(),
  );
}

export function saleBelongsToProduct(sale: KiwifySale, productId: string): boolean {
  const ids = [sale.product_id, sale.product?.id].filter(Boolean).map(String);
  if (ids.length === 0) return true; // sem info de produto, confia no filtro da API
  return ids.includes(productId);
}

export function saleStatusToSubscription(
  sale: KiwifySale,
): "active" | "past_due" | "canceled" | null {
  const status = (sale.subscription?.status ?? sale.status ?? "").toLowerCase();
  if (["paid", "approved", "active"].includes(status)) return "active";
  if (["waiting_payment", "late", "past_due", "pending"].includes(status)) return "past_due";
  if (["refunded", "chargedback", "canceled", "cancelled", "refused"].includes(status))
    return "canceled";
  return null;
}

export function planNameFromSale(sale: KiwifySale): string {
  return [sale.subscription?.plan?.name, sale.subscription?.plan?.frequency, sale.product?.name]
    .filter(Boolean)
    .join(" | ");
}

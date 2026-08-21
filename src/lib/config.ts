/** Links de checkout da assinatura Daily Grace (Kiwify). */
export const KIWIFY_CHECKOUT_MONTHLY = "https://pay.kiwify.com.br/gjXBXNI";
export const KIWIFY_CHECKOUT_ANNUAL = "https://pay.kiwify.com.br/ovaS3aT";

/** Link padrão (mensal) — usado nos CTAs genéricos das outras páginas. */
export const KIWIFY_CHECKOUT_URL =
  import.meta.env.VITE_KIWIFY_CHECKOUT_URL || KIWIFY_CHECKOUT_MONTHLY;

export const APP_NAME = "Daily Grace";

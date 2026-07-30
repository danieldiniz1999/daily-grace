/** Detecta se o plano é mensal ou anual a partir do nome. */
export function detectBillingPeriod(name: string): "monthly" | "annual" | null {
  const lower = name.toLowerCase();
  if (/\b(mensal|monthly|month|m[eê]s)\b/.test(lower)) return "monthly";
  if (/\b(anual|annual|yearly|year|ano)\b/.test(lower)) return "annual";
  return null;
}

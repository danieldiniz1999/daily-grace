const TZ = "America/Sao_Paulo";

/** Data de hoje (fuso de São Paulo) no formato YYYY-MM-DD. */
export function todayISO(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parts;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatLong(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parseISODate(iso));
}

export function formatShort(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(parseISODate(iso));
}

export function monthLabel(iso: string): string {
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(parseISODate(iso));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

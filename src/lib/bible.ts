export type BibleBook = {
  i: number;
  abbrev: string;
  name: string;
  chapters: number;
};

export const BIBLE_VERSIONS = [
  { id: "nvt", label: "NVT", name: "Nova Versão Transformadora" },
  { id: "arc", label: "ARC", name: "Almeida Revista e Corrigida" },
  { id: "ara", label: "ARA", name: "Almeida Revista e Atualizada" },
  { id: "naa", label: "NAA", name: "Nova Almeida Atualizada" },
  { id: "acf", label: "ACF", name: "Almeida Corrigida Fiel" },
  { id: "kja", label: "KJA", name: "King James Atualizada" },
  { id: "nvi", label: "NVI", name: "Nova Versão Internacional" },
  { id: "ntlh", label: "NTLH", name: "Nova Tradução na Linguagem de Hoje" },
] as const;

export const DEFAULT_BIBLE_VERSION = "nvt" as const;

export type BibleVersionId = (typeof BIBLE_VERSIONS)[number]["id"];

let booksCache: Promise<BibleBook[]> | null = null;
const bookCache = new Map<string, Promise<string[][]>>();

export function loadBooks(): Promise<BibleBook[]> {
  if (!booksCache) {
    booksCache = fetch("/bible/books.json").then((r) => r.json());
  }
  return booksCache;
}

export function loadBook(version: BibleVersionId, bookIndex: number): Promise<string[][]> {
  const key = `${version}:${bookIndex}`;
  let cached = bookCache.get(key);
  if (!cached) {
    cached = fetch(`/bible/${version}/${bookIndex}.json`).then((r) => r.json());
    bookCache.set(key, cached);
  }
  return cached;
}

export function formatReference(book: string, chapter: number, verses: number[]) {
  if (verses.length === 0) return `${book} ${chapter}`;
  const sorted = [...verses].sort((a, b) => a - b);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const contiguous = sorted.every((v, idx) => v === first + idx);
  if (sorted.length === 1) return `${book} ${chapter}:${first}`;
  if (contiguous) return `${book} ${chapter}:${first}-${last}`;
  return `${book} ${chapter}:${sorted.join(",")}`;
}

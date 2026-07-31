import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpenText, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin, useSubscription } from "@/hooks/useAppData";
import {
  BIBLE_VERSIONS,
  DEFAULT_BIBLE_VERSION,
  loadBook,
  loadBooks,
  type BibleBook,
  type BibleVersionId,
} from "@/lib/bible";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/biblia")({
  head: () => ({
    meta: [
      { title: "Bíblia | Daily Grace" },
      { name: "description", content: "Leia a Bíblia completa em várias traduções dentro do Daily Grace." },
      { property: "og:title", content: "Bíblia | Daily Grace" },
      { property: "og:description", content: "A Palavra completa, sempre com você." },
    ],
  }),
  component: BibliaPage,
});

function BibliaPage() {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin(user?.id);
  const { data: subscription, isLoading: loadingSub } = useSubscription(user?.id);
  const blocked = !loadingSub && subscription?.status !== "active" && !isAdmin;

  const [version, setVersion] = useState<BibleVersionId>(DEFAULT_BIBLE_VERSION);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [bookIndex, setBookIndex] = useState(42);
  const [chapters, setChapters] = useState<string[][] | null>(null);
  const [chapter, setChapter] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void loadBooks().then(setBooks);
  }, []);

  useEffect(() => {
    setChapters(null);
    void loadBook(version, bookIndex).then(setChapters);
  }, [version, bookIndex]);

  const book = books.find((b) => b.i === bookIndex) ?? null;
  const verses = chapters?.[chapter - 1] ?? [];

  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return books;
    return books.filter(
      (b) => b.name.toLowerCase().includes(term) || b.abbrev.toLowerCase().includes(term),
    );
  }, [books, search]);

  if (blocked) {
    return (
      <AppShell isAdmin={isAdmin}>
        <div className="rounded-3xl border border-border/60 bg-background p-8 text-center">
          <BookOpenText className="text-primary mx-auto size-8" />
          <h1 className="font-display mt-3 text-2xl font-semibold">Bíblia bloqueada</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Regularize sua assinatura para voltar a ler a Bíblia no Daily Grace.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell isAdmin={isAdmin}>
      <div className="space-y-5">
        <header className="space-y-2">
          <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
            Palavra completa
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Bíblia</h1>
          <div className="flex flex-wrap gap-2">
            {BIBLE_VERSIONS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVersion(v.id)}
                title={v.name}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  version === v.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2 size-4" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8"
              />
            </div>
            <ScrollArea className="h-64 rounded-2xl border border-border/60 bg-background lg:h-[28rem]">
              <div className="p-1">
                {filteredBooks.map((b) => (
                  <button
                    key={b.i}
                    type="button"
                    onClick={() => {
                      setBookIndex(b.i);
                      setChapter(1);
                    }}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      bookIndex === b.i
                        ? "bg-secondary text-secondary-foreground font-medium"
                        : "hover:bg-muted",
                    )}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </aside>

          <section className="space-y-3">
            {book ? (
              <ScrollArea className="max-h-24 rounded-2xl border border-border/60 bg-background">
                <div className="flex flex-wrap gap-1 p-2">
                  {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setChapter(c)}
                      className={cn(
                        "size-8 rounded-lg text-xs font-medium transition-colors",
                        chapter === c
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            ) : null}

            <article className="rounded-3xl border border-border/60 bg-background p-6">
              <h2 className="font-display text-2xl font-semibold">
                {book?.name} {chapter}
              </h2>
              <div className="mt-4 space-y-3">
                {chapters === null ? (
                  <>
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-11/12" />
                    <Skeleton className="h-5 w-10/12" />
                  </>
                ) : (
                  verses.map((text, idx) => (
                    <p key={idx} className="text-[15px] leading-relaxed">
                      <span className="text-primary mr-1 align-super text-xs font-semibold">
                        {idx + 1}
                      </span>
                      {text}
                    </p>
                  ))
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={chapter <= 1}
                  onClick={() => setChapter((c) => Math.max(1, c - 1))}
                  className="gap-1"
                >
                  <ChevronLeft className="size-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!book || chapter >= book.chapters}
                  onClick={() => setChapter((c) => Math.min(book?.chapters ?? c, c + 1))}
                  className="gap-1"
                >
                  Próximo
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </article>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

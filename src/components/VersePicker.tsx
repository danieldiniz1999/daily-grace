import { useEffect, useMemo, useState } from "react";
import { BookOpenText, Check, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BIBLE_VERSIONS,
  DEFAULT_BIBLE_VERSION,
  formatReference,
  loadBook,
  loadBooks,
  type BibleBook,
  type BibleVersionId,
} from "@/lib/bible";
import { cn } from "@/lib/utils";

export function VersePicker({
  onSelect,
  triggerLabel = "Escolher na Bíblia",
}: {
  onSelect: (value: { reference: string; text: string }) => void;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState<BibleVersionId>(DEFAULT_BIBLE_VERSION);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [bookIndex, setBookIndex] = useState<number | null>(null);
  const [chapters, setChapters] = useState<string[][] | null>(null);
  const [chapter, setChapter] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) void loadBooks().then(setBooks);
  }, [open]);

  useEffect(() => {
    if (bookIndex === null) return;
    setChapters(null);
    void loadBook(version, bookIndex).then(setChapters);
  }, [version, bookIndex]);

  const book = bookIndex === null ? null : books.find((b) => b.i === bookIndex) ?? null;
  const verses = chapters?.[chapter - 1] ?? [];

  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return books;
    return books.filter(
      (b) => b.name.toLowerCase().includes(term) || b.abbrev.toLowerCase().includes(term),
    );
  }, [books, search]);

  function toggleVerse(n: number) {
    setSelected((prev) => (prev.includes(n) ? prev.filter((v) => v !== n) : [...prev, n]));
  }

  function confirm() {
    if (!book || selected.length === 0) return;
    const sorted = [...selected].sort((a, b) => a - b);
    const text = sorted.map((n) => verses[n - 1]).join(" ");
    onSelect({ reference: formatReference(book.name, chapter, sorted), text });
    setOpen(false);
    setSelected([]);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <BookOpenText className="size-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Escolher versículo</DialogTitle>
          <DialogDescription>
            Selecione a tradução, o livro, o capítulo e um ou mais versículos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {BIBLE_VERSIONS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVersion(v.id)}
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

        <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
          <div className="space-y-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2 size-4" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8"
              />
            </div>
            <ScrollArea className="h-64 rounded-lg border">
              <div className="p-1">
                {filteredBooks.map((b) => (
                  <button
                    key={b.i}
                    type="button"
                    onClick={() => {
                      setBookIndex(b.i);
                      setChapter(1);
                      setSelected([]);
                    }}
                    className={cn(
                      "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                      bookIndex === b.i
                        ? "bg-secondary text-secondary-foreground"
                        : "hover:bg-muted",
                    )}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            {book ? (
              <>
                <ScrollArea className="max-h-20 rounded-lg border">
                  <div className="flex flex-wrap gap-1 p-2">
                    {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setChapter(c);
                          setSelected([]);
                        }}
                        className={cn(
                          "size-7 rounded-md text-xs font-medium transition-colors",
                          chapter === c
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground",
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </ScrollArea>

                <ScrollArea className="h-64 rounded-lg border">
                  <div className="space-y-1 p-2">
                    {chapters === null ? (
                      <p className="text-muted-foreground p-2 text-sm">Carregando…</p>
                    ) : (
                      verses.map((text, idx) => {
                        const n = idx + 1;
                        const active = selected.includes(n);
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => toggleVerse(n)}
                            className={cn(
                              "flex w-full gap-2 rounded-md p-2 text-left text-sm transition-colors",
                              active ? "bg-secondary" : "hover:bg-muted",
                            )}
                          >
                            <span className="text-primary shrink-0 text-xs font-semibold">
                              {n}
                            </span>
                            <span>{text}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="text-muted-foreground flex h-[22rem] items-center justify-center rounded-lg border text-sm">
                Escolha um livro
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">
            {book && selected.length > 0
              ? formatReference(book.name, chapter, selected)
              : "Nenhum versículo selecionado"}
          </p>
          <Button type="button" onClick={confirm} disabled={selected.length === 0} className="gap-2">
            <Check className="size-4" />
            Usar versículo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

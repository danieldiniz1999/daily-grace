import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Copy,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { VersePicker } from "@/components/VersePicker";
import { VibeDatePicker } from "@/components/VibeDatePicker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAppData";
import { supabase } from "@/integrations/supabase/client";
import { formatLong, monthLabel, todayISO } from "@/lib/date";
import { cn } from "@/lib/utils";
import { refreshKiwifyStatus, syncKiwifySales } from "@/lib/kiwify.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administração | Daily Grace" },
      { name: "description", content: "Cadastre devocionais e acompanhe as assinantes." },
      { property: "og:title", content: "Administração | Daily Grace" },
      { property: "og:description", content: "Painel administrativo do Daily Grace." },
    ],
  }),
  component: AdminPage,
});

type FormState = {
  id?: string;
  publish_date: string;
  title: string;
  verse_reference: string;
  verse_text: string;
  content: string;
  reflection_question: string;
  prayer: string;
};

const LIMITS = {
  title: 120,
  verse_reference: 100,
  verse_text: 800,
  content: 6000,
  reflection_question: 500,
  prayer: 1500,
};

const DRAFT_KEY = "dg-admin-devotional-draft";

const emptyForm = (): FormState => ({
  publish_date: todayISO(),
  title: "",
  verse_reference: "",
  verse_text: "",
  content: "",
  reflection_question: "",
  prayer: "",
});

const isBlank = (f: FormState) =>
  !f.title && !f.verse_reference && !f.verse_text && !f.content && !f.reflection_question && !f.prayer;

function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function AdminPage() {
  const { user } = useAuth();
  const { data: isAdmin, isLoading: loadingRole } = useIsAdmin(user?.id);

  if (loadingRole) return <AppShell />;
  if (!isAdmin) {
    return (
      <AppShell>
        <div className="rounded-3xl border border-border/60 bg-card p-10 text-center">
          <h1 className="font-display text-2xl font-semibold">Área restrita</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta página é exclusiva das administradoras.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell isAdmin>
      <h1 className="font-display text-4xl md:text-5xl font-semibold">Administração</h1>
      <Tabs defaultValue="devocionais" className="mt-8">
        <TabsList className="rounded-full bg-secondary p-1.5">
          <TabsTrigger value="devocionais" className="rounded-full px-6 py-2 text-sm md:text-base">
            Devocionais
          </TabsTrigger>
          <TabsTrigger value="assinantes" className="rounded-full px-6 py-2 text-sm md:text-base">
            Assinantes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="devocionais" className="mt-8">
          <DevotionalsAdmin />
        </TabsContent>
        <TabsContent value="assinantes" className="mt-8">
          <SubscribersAdmin />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function CharCount({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={`text-xs md:text-sm font-medium ${over ? "text-destructive" : "text-muted-foreground"}`}>
      {value.length}/{max}
    </span>
  );
}

function AutoTextarea({
  value,
  minRows = 3,
  className,
  ...rest
}: React.ComponentProps<typeof Textarea> & { minRows?: number }) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <Textarea
      ref={ref}
      rows={minRows}
      value={value}
      className={cn("text-base leading-relaxed md:text-base", className)}
      {...rest}
    />
  );
}

function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Label className={cn("text-sm md:text-base font-semibold", className)}>{children}</Label>;
}

function DevotionalsAdmin() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [visible, setVisible] = useState(8);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const today = todayISO();

  const { data: list, isLoading } = useQuery({
    queryKey: ["admin-devotionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devotionals")
        .select("*")
        .order("publish_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Recupera rascunho salvo automaticamente
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as FormState;
      if (!isBlank(draft)) {
        setForm(draft);
        toast.info("Rascunho recuperado.");
      }
    } catch {
      /* ignora */
    }
  }, []);

  useEffect(() => {
    if (isBlank(form)) localStorage.removeItem(DRAFT_KEY);
    else localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  const takenDates = useMemo(
    () => new Set((list ?? []).filter((d) => d.id !== form.id).map((d) => d.publish_date)),
    [list, form.id],
  );
  const dateConflict = takenDates.has(form.publish_date);

  const nextFreeDate = useMemo(() => {
    let candidate = today;
    let guard = 0;
    while (takenDates.has(candidate) && guard < 400) {
      candidate = addDays(candidate, 1);
      guard += 1;
    }
    return candidate;
  }, [takenDates, today]);

  const months = useMemo(() => {
    const set = new Set((list ?? []).map((d) => d.publish_date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [list]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (list ?? []).filter((d) => {
      const matchMonth = monthFilter === "all" || d.publish_date.startsWith(monthFilter);
      const matchTerm =
        !term ||
        d.title.toLowerCase().includes(term) ||
        d.verse_reference.toLowerCase().includes(term) ||
        d.publish_date.includes(term);
      return matchMonth && matchTerm;
    });
  }, [list, search, monthFilter]);

  const stats = useMemo(() => {
    const all = list ?? [];
    return {
      total: all.length,
      published: all.filter((d) => d.publish_date <= today).length,
      scheduled: all.filter((d) => d.publish_date > today).length,
    };
  }, [list, today]);

  const save = useMutation({
    mutationFn: async (values: FormState) => {
      const payload = {
        publish_date: values.publish_date,
        title: values.title.trim(),
        verse_reference: values.verse_reference.trim(),
        verse_text: values.verse_text.trim(),
        content: values.content.trim(),
        reflection_question: values.reflection_question.trim() || null,
        prayer: values.prayer.trim() || null,
      };
      const query = values.id
        ? supabase.from("devotionals").update(payload).eq("id", values.id)
        : supabase.from("devotionals").insert(payload);
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Devocional salvo!");
      localStorage.removeItem(DRAFT_KEY);
      setForm(emptyForm());
      queryClient.invalidateQueries({ queryKey: ["admin-devotionals"] });
      queryClient.invalidateQueries({ queryKey: ["devotionals"] });
    },
    onError: (e: Error) =>
      toast.error(
        e.message.includes("duplicate")
          ? "Já existe um devocional nesta data."
          : "Não foi possível salvar: " + e.message,
      ),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("devotionals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Devocional removido.");
      queryClient.invalidateQueries({ queryKey: ["admin-devotionals"] });
      queryClient.invalidateQueries({ queryKey: ["devotionals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const focusForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const loadInto = (d: (typeof filtered)[number], asCopy = false) => {
    setForm({
      id: asCopy ? undefined : d.id,
      publish_date: asCopy ? nextFreeDate : d.publish_date,
      title: asCopy ? `${d.title} (cópia)`.slice(0, LIMITS.title) : d.title,
      verse_reference: d.verse_reference,
      verse_text: d.verse_text,
      content: d.content,
      reflection_question: d.reflection_question ?? "",
      prayer: d.prayer ?? "",
    });
    focusForm();
    if (asCopy) toast.info(`Cópia criada para ${formatLong(nextFreeDate)}.`);
  };

  const tooLong =
    form.title.length > LIMITS.title ||
    form.verse_reference.length > LIMITS.verse_reference ||
    form.verse_text.length > LIMITS.verse_text ||
    form.content.length > LIMITS.content ||
    form.reflection_question.length > LIMITS.reflection_question ||
    form.prayer.length > LIMITS.prayer;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Devocionais" value={stats.total} />
        <StatCard label="Já liberados" value={stats.published} />
        <StatCard label="Agendados" value={stats.scheduled} />
        <StatCard label="Próxima data livre" value={formatLong(nextFreeDate).split(",")[1]?.trim() ?? nextFreeDate} small />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            if (dateConflict) return toast.error("Já existe um devocional nesta data.");
            if (tooLong) return toast.error("Algum campo passou do limite de caracteres.");
            save.mutate(form);
          }}
          className="h-fit space-y-6 rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-card"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-2xl md:text-3xl font-semibold">
              {form.id ? "Editar devocional" : "Novo devocional"}
            </h2>
            {form.id && <Badge variant="secondary" className="text-sm">editando</Badge>}
          </div>

          <Accordion type="single" collapsible defaultValue="etapa-1" className="w-full space-y-4">
            <AccordionItem value="etapa-1" className="rounded-2xl border border-border/60 bg-secondary/20 px-4 md:px-5 py-1">
              <AccordionTrigger className="text-base md:text-lg font-semibold [&>svg]:size-5">
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-sm">1</span>
                  Data e referência bíblica
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <div className="grid gap-5 pb-2 sm:grid-cols-2">
                  <div className="space-y-3">
                    <FieldLabel>Data de liberação</FieldLabel>
                    <VibeDatePicker
                      value={form.publish_date}
                      onChange={(v) => setForm((f) => ({ ...f, publish_date: v }))}
                      invalid={dateConflict}
                    />

                    {dateConflict ? (
                      <p className="flex items-center gap-1.5 text-xs md:text-sm text-destructive">
                        <TriangleAlert className="size-4" /> Já existe um devocional nesta data.
                      </p>
                    ) : (
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-xs md:text-sm text-primary font-medium hover:underline"
                        onClick={() => setForm((f) => ({ ...f, publish_date: nextFreeDate }))}
                      >
                        <CalendarPlus className="size-4" /> usar próxima data livre
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FieldLabel>Referência bíblica</FieldLabel>
                      <CharCount value={form.verse_reference} max={LIMITS.verse_reference} />
                    </div>
                    <Input
                      required
                      value={form.verse_reference}
                      onChange={set("verse_reference")}
                      className="h-11 text-base md:text-base"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="etapa-2" className="rounded-2xl border border-border/60 bg-secondary/20 px-4 md:px-5 py-1">
              <AccordionTrigger className="text-base md:text-lg font-semibold [&>svg]:size-5">
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-sm">2</span>
                  Título e versículo
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-5 pb-4 pt-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FieldLabel>Título</FieldLabel>
                    <CharCount value={form.title} max={LIMITS.title} />
                  </div>
                  <Input required value={form.title} onChange={set("title")} className="h-11 text-base md:text-base" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FieldLabel>Versículo</FieldLabel>
                    <CharCount value={form.verse_text} max={LIMITS.verse_text} />
                  </div>
                  <VersePicker
                    onSelect={({ reference, text }) =>
                      setForm((f) => ({ ...f, verse_reference: reference, verse_text: text }))
                    }
                  />
                  <AutoTextarea required minRows={3} value={form.verse_text} onChange={set("verse_text")} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="etapa-3" className="rounded-2xl border border-border/60 bg-secondary/20 px-4 md:px-5 py-1">
              <AccordionTrigger className="text-base md:text-lg font-semibold [&>svg]:size-5">
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-sm">3</span>
                  Mensagem do dia
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FieldLabel>Mensagem</FieldLabel>
                    <CharCount value={form.content} max={LIMITS.content} />
                  </div>
                  <AutoTextarea required minRows={10} value={form.content} onChange={set("content")} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="etapa-4" className="rounded-2xl border border-border/60 bg-secondary/20 px-4 md:px-5 py-1">
              <AccordionTrigger className="text-base md:text-lg font-semibold [&>svg]:size-5">
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-sm">4</span>
                  Reflexão e oração
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-5 pb-4 pt-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FieldLabel>Pergunta para refletir (opcional)</FieldLabel>
                    <CharCount value={form.reflection_question} max={LIMITS.reflection_question} />
                  </div>
                  <AutoTextarea minRows={3} value={form.reflection_question} onChange={set("reflection_question")} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FieldLabel>Oração (opcional)</FieldLabel>
                    <CharCount value={form.prayer} max={LIMITS.prayer} />
                  </div>
                  <AutoTextarea minRows={5} value={form.prayer} onChange={set("prayer")} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="etapa-5" className="rounded-2xl border border-border/60 bg-secondary/20 px-4 md:px-5 py-1">
              <AccordionTrigger className="text-base md:text-lg font-semibold [&>svg]:size-5">
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-sm">5</span>
                  Revisar e publicar
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <div className="rounded-2xl bg-secondary/50 p-5 text-sm md:text-base">
                  <p className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Resumo do devocional</p>
                  <ul className="space-y-2">
                    <li><span className="text-muted-foreground">Data:</span> {formatLong(form.publish_date)}</li>
                    <li><span className="text-muted-foreground">Referência:</span> {form.verse_reference || "—"}</li>
                    <li><span className="text-muted-foreground">Título:</span> {form.title || "—"}</li>
                    <li><span className="text-muted-foreground">Versículo:</span> {form.verse_text ? `${form.verse_text.slice(0, 70)}...` : "—"}</li>
                    <li><span className="text-muted-foreground">Mensagem:</span> {form.content ? `${form.content.slice(0, 100)}...` : "—"}</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/40">
            <Button
              type="submit"
              disabled={save.isPending || dateConflict || tooLong}
              className="bg-grace rounded-full px-8 py-5 text-base md:text-lg font-semibold btn-glow shadow-soft"
            >
              <Plus className="size-5" />
              {save.isPending ? "Salvando..." : form.id ? "Salvar alterações" : "Publicar devocional"}
            </Button>
            {!isBlank(form) && (
              <Button
                type="button"
                variant="outline"
                className="rounded-full px-6 py-5 text-base"
                onClick={() => {
                  setForm(emptyForm());
                  localStorage.removeItem(DRAFT_KEY);
                }}
              >
                Limpar
              </Button>
            )}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            O texto fica salvo automaticamente neste navegador enquanto você escreve.
          </p>
        </form>

        <div className="space-y-8">
          {showPreview && <DevotionalPreview form={form} />}

          <div className="space-y-4">
            <h2 className="font-display text-2xl md:text-3xl font-semibold">Publicados</h2>
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-56">
                <Search className="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-full pl-10 h-11 text-base"
                />
              </div>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-48 rounded-full h-11 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {monthLabel(`${m}-01`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading && (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            )}

            {filtered.slice(0, visible).map((d) => {
              const scheduled = d.publish_date > today;
              const isToday = d.publish_date === today;
              return (
                <div
                  key={d.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-card transition-shadow"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-sm text-muted-foreground">{formatLong(d.publish_date)}</p>
                      {isToday ? (
                        <Badge className="bg-grace gap-1 text-xs md:text-sm">
                          <CheckCircle2 className="size-3.5" /> hoje
                        </Badge>
                      ) : scheduled ? (
                        <Badge variant="outline" className="gap-1 text-xs md:text-sm">
                          <CalendarClock className="size-3.5" /> agendado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs md:text-sm">
                          liberado
                        </Badge>
                      )}
                    </div>
                    <p className="font-display truncate text-xl md:text-2xl font-semibold">{d.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{d.verse_reference}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="icon" variant="ghost" className="size-10" title="Editar" onClick={() => loadInto(d)}>
                      <Pencil className="size-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-10"
                      title="Duplicar"
                      onClick={() => loadInto(d, true)}
                    >
                      <Copy className="size-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-10"
                      title="Excluir"
                      onClick={() => setPendingDelete({ id: d.id, title: d.title })}
                    >
                      <Trash2 className="size-5 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {filtered.length > visible && (
              <Button
                variant="outline"
                className="w-full rounded-full py-5 text-base"
                onClick={() => setVisible((v) => v + 8)}
              >
                Carregar mais ({filtered.length - visible})
              </Button>
            )}

            {!isLoading && filtered.length === 0 && (
              <p className="text-base text-muted-foreground">
                {list?.length ? "Nenhum devocional encontrado com esse filtro." : "Nenhum devocional cadastrado ainda."}
              </p>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir devocional?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.title}” será removido para sempre e deixará de aparecer para as
              assinantes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) remove.mutate(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ label, value, small }: { label: string; value: string | number; small?: boolean }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <p className="text-sm md:text-base text-muted-foreground">{label}</p>
      <p className={`font-display font-semibold ${small ? "text-lg md:text-xl" : "text-3xl md:text-4xl"}`}>{value}</p>
    </div>
  );
}

function DevotionalPreview({ form }: { form: FormState }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-card">
      <p className="text-sm tracking-wide text-muted-foreground uppercase">Prévia da assinante</p>
      <p className="mt-3 text-sm text-muted-foreground">{formatLong(form.publish_date)}</p>
      <h3 className="font-display mt-1 text-2xl md:text-3xl font-semibold">
        {form.title || "Título do devocional"}
      </h3>
      <div className="bg-secondary/60 mt-5 rounded-2xl p-5">
        <p className="font-display text-lg md:text-xl italic leading-relaxed">
          {form.verse_text || "O texto do versículo aparece aqui."}
        </p>
        <p className="text-primary mt-2 text-sm md:text-base font-semibold">
          {form.verse_reference || "Referência"}
        </p>
      </div>
      <div className="mt-5 space-y-4 text-base md:text-lg leading-relaxed whitespace-pre-line">
        {form.content || "A mensagem do dia aparece aqui conforme você escreve."}
      </div>
      {form.reflection_question && (
        <div className="border-primary/40 mt-5 border-l-2 pl-4 text-base md:text-lg">
          <p className="text-sm text-muted-foreground">Para refletir</p>
          <p>{form.reflection_question}</p>
        </div>
      )}
      {form.prayer && (
        <div className="mt-5 rounded-2xl border border-border/60 p-5 text-base md:text-lg whitespace-pre-line">
          <p className="text-sm text-muted-foreground">Oração</p>
          {form.prayer}
        </div>
      )}
    </div>
  );
}

function SubscribersAdmin() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["admin-subscribers"],
    queryFn: async () => {
      const [subs, profiles] = await Promise.all([
        supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*"),
      ]);
      if (subs.error) throw subs.error;
      if (profiles.error) throw profiles.error;
      return (subs.data ?? []).map((s) => ({
        ...s,
        profile: (profiles.data ?? []).find((p) => p.id === s.user_id),
      }));
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "past_due" | "canceled" }) => {
      const { error } = await supabase.from("subscriptions").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status atualizado.");
      queryClient.invalidateQueries({ queryKey: ["admin-subscribers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <KiwifyPanel
        onDone={() => queryClient.invalidateQueries({ queryKey: ["admin-subscribers"] })}
      />

      {(data ?? []).map((s) => (
        <div
          key={s.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-5"
        >
          <div className="min-w-0">
            <p className="font-semibold text-base md:text-lg">{s.profile?.full_name ?? "Sem nome"}</p>
            <p className="text-sm break-all text-muted-foreground">
              {s.profile?.email ?? s.kiwify_customer_email}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Compra: {formatLong(s.started_at.slice(0, 10))}
            </p>
          </div>
          <Select
            value={s.status}
            onValueChange={(v) =>
              update.mutate({ id: s.id, status: v as "active" | "past_due" | "canceled" })
            }
          >
            <SelectTrigger className="w-44 rounded-full h-11 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativa</SelectItem>
              <SelectItem value="past_due">Em atraso</SelectItem>
              <SelectItem value="canceled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))}
      {data?.length === 0 && (
        <p className="text-base text-muted-foreground">Nenhuma assinante ainda.</p>
      )}
    </div>
  );
}

function KiwifyPanel({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const syncFn = useServerFn(syncKiwifySales);
  const refreshFn = useServerFn(refreshKiwifyStatus);

  const sync = useMutation({
    mutationFn: () => syncFn({}),
    onSuccess: (r) => {
      toast.success(
        `Sincronizado: ${r.imported} nova(s), ${r.updated} atualizada(s), ${r.skipped} ignorada(s).`,
      );
      if (r.errors.length) toast.error(r.errors.join(" • "));
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const refresh = useMutation({
    mutationFn: () => refreshFn({ data: { email: email.trim().toLowerCase() } }),
    onSuccess: (r) => {
      if (!r.found) toast.error("Nenhuma compra encontrada na Kiwify para esse e-mail.");
      else toast.success(`Status na Kiwify: ${r.status ?? "indefinido"}. Atualizado no app.`);
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <RefreshCw className="size-5 text-primary" />
        </span>
        <div>
          <p className="font-semibold text-base md:text-lg">Integração Kiwify</p>
          <p className="text-sm text-muted-foreground">
            Sincroniza apenas as compras do produto Daily Grace.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          className="rounded-full px-6 py-5 text-base"
          onClick={() => sync.mutate()}
          disabled={sync.isPending}
        >
          {sync.isPending ? "Sincronizando..." : "Importar compras da Kiwify"}
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-64 rounded-full h-11 text-base"
        />
        <Button
          variant="outline"
          className="rounded-full h-11 px-5 text-base"
          onClick={() => refresh.mutate()}
          disabled={refresh.isPending || !email.includes("@")}
        >
          {refresh.isPending ? "Consultando..." : "Conferir status"}
        </Button>
      </div>
    </div>
  );
}

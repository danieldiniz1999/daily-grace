import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpenText, Lock, Quote, Search, Sparkles } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useDevotionals, useIsAdmin, useProfile, useSubscription } from "@/hooks/useAppData";
import { KIWIFY_CHECKOUT_URL } from "@/lib/config";
import { formatLong, monthLabel, parseISODate, todayISO } from "@/lib/date";

export const Route = createFileRoute("/_authenticated/devocionais")({
  head: () => ({
    meta: [
      { title: "Meus devocionais | Daily Grace" },
      { name: "description", content: "Leia o devocional de hoje e revisite os já liberados." },
      { property: "og:title", content: "Meus devocionais | Daily Grace" },
      { property: "og:description", content: "Sua jornada diária com Deus, um dia por vez." },
    ],
  }),
  component: DevocionaisPage,
});

function readingMinutes(text: string) {
  return Math.max(2, Math.round(text.split(/\s+/).length / 200));
}

function dayNumber(iso: string) {
  return iso.slice(8, 10);
}

function weekdayShort(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
    .format(parseISODate(iso))
    .replace(".", "")
    .toUpperCase();
}

function DevocionaisPage() {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin(user?.id);
  const { data: profile } = useProfile(user?.id);
  const { data: subscription, isLoading: loadingSub } = useSubscription(user?.id);
  const { data: devotionals, isLoading } = useDevotionals();
  const [search, setSearch] = useState("");

  const today = todayISO();
  const list = devotionals ?? [];
  const todayDev = list.find((d) => d.publish_date === today);
  const history = list.filter((d) => d.publish_date !== today);
  const blocked = !loadingSub && subscription?.status !== "active" && !isAdmin;

  const firstName = (profile?.full_name ?? "").split(" ")[0];

  const filteredHistory = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return history;
    return history.filter(
      (d) =>
        d.title.toLowerCase().includes(term) ||
        d.verse_reference.toLowerCase().includes(term) ||
        d.verse_text.toLowerCase().includes(term),
    );
  }, [history, search]);

  const groups = filteredHistory.reduce<Record<string, typeof history>>((acc, d) => {
    const key = monthLabel(d.publish_date);
    (acc[key] ||= []).push(d);
    return acc;
  }, {});

  return (
    <AppShell isAdmin={isAdmin}>
      {/* Cabeçalho */}
      <header className="mb-10">
        <span className="border-primary/20 bg-card/70 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide uppercase backdrop-blur">
          <span className="bg-grace size-1.5 rounded-full" />
          {formatLong(today)}
        </span>
        <h1 className="font-display mt-3 text-4xl leading-tight font-semibold sm:text-5xl">
          {firstName ? `Olá, ${firstName}` : "Bem-vinda"}
          <span className="text-primary">.</span>
        </h1>
        <p className="text-muted-foreground mt-2 max-w-lg text-sm leading-relaxed">
          Reserve alguns minutos para respirar, ler e conversar com Deus.
        </p>
      </header>

      {blocked ? (
        <BlockedState status={subscription?.status} />
      ) : isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-[2rem]" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        </div>
      ) : (
        <>
          {todayDev ? (
            <Link
              to="/devocional/$date"
              params={{ date: todayDev.publish_date }}
              className="bg-grace shadow-soft group relative block overflow-hidden rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-1 sm:p-10"
            >
              {/* textura decorativa */}
              <span className="bg-cream/20 pointer-events-none absolute -top-24 -right-16 size-64 rounded-full blur-2xl" />
              <span className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-white/10 blur-2xl" />
              <Quote className="text-primary-foreground/15 pointer-events-none absolute top-6 right-8 size-24" />

              <div className="relative">
                <span className="bg-cream text-cream-foreground inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase">
                  <Sparkles className="size-3" /> Devocional de hoje
                </span>
                <h2 className="font-display text-primary-foreground mt-5 max-w-2xl text-3xl leading-tight font-semibold text-balance sm:text-[2.6rem]">
                  {todayDev.title}
                </h2>

                <div className="border-primary-foreground/25 mt-5 max-w-xl border-l-2 pl-4">
                  <p className="text-primary-foreground/90 font-display text-lg leading-relaxed italic">
                    “{todayDev.verse_text}”
                  </p>
                  <p className="text-primary-foreground/70 mt-2 text-xs font-medium tracking-wide uppercase">
                    {todayDev.verse_reference}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <span className="bg-background/95 text-primary inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-transform group-hover:translate-x-0.5">
                    Ler agora <ArrowRight className="size-4" />
                  </span>
                  <span className="text-primary-foreground/70 text-xs">
                    {readingMinutes(todayDev.content)} min de leitura
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="border-primary/25 bg-card/70 rounded-[2rem] border border-dashed p-12 text-center backdrop-blur">
              <span className="bg-secondary text-primary mx-auto flex size-14 items-center justify-center rounded-full">
                <BookOpenText className="size-6" />
              </span>
              <h2 className="font-display mt-4 text-2xl font-semibold">
                O devocional de hoje ainda está sendo preparado
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Volte em instantes — ele será liberado ainda hoje.
              </p>
            </div>
          )}

          <section className="mt-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-semibold">Meu acervo</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {history.length > 0
                    ? `${history.length} devocional${history.length > 1 ? "is" : ""} liberado${history.length > 1 ? "s" : ""} para você.`
                    : "Todos os devocionais já liberados para você."}
                </p>
              </div>
              {history.length > 3 && (
                <div className="relative w-full sm:w-64">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar no acervo"
                    className="bg-card/80 rounded-full pl-9"
                  />
                </div>
              )}
            </div>

            {history.length === 0 ? (
              <div className="border-border/60 bg-card/70 mt-6 rounded-2xl border p-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Seu acervo começa hoje. A cada dia um novo devocional entra aqui. 💜
                </p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <p className="text-muted-foreground mt-6 text-sm">
                Nada encontrado para “{search}”.
              </p>
            ) : (
              <div className="mt-8 space-y-10">
                {Object.entries(groups).map(([mes, itens]) => (
                  <div key={mes}>
                    <div className="flex items-center gap-3">
                      <h4 className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                        {mes}
                      </h4>
                      <span className="bg-border/70 h-px flex-1" />
                      <span className="text-muted-foreground text-[11px]">{itens.length}</span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {itens.map((d) => (
                        <Link
                          key={d.id}
                          to="/devocional/$date"
                          params={{ date: d.publish_date }}
                          className="group border-border/60 bg-card shadow-card hover:border-primary/40 relative flex items-center gap-4 overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5"
                        >
                          <span className="bg-secondary text-secondary-foreground group-hover:bg-grace group-hover:text-primary-foreground flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl transition-colors">
                            <span className="font-display text-xl leading-none font-semibold">
                              {dayNumber(d.publish_date)}
                            </span>
                            <span className="mt-0.5 text-[10px] tracking-wider opacity-70">
                              {weekdayShort(d.publish_date)}
                            </span>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="font-display block truncate text-lg leading-snug font-semibold">
                              {d.title}
                            </span>
                            <span className="text-muted-foreground mt-1 block truncate text-xs">
                              {d.verse_reference} · {readingMinutes(d.content)} min
                            </span>
                          </span>
                          <ArrowRight className="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}

function BlockedState({ status }: { status?: string }) {
  const isPastDue = status === "past_due";
  return (
    <div className="border-border/60 bg-card shadow-soft rounded-[2rem] border p-10 text-center">
      <span className="bg-grace mx-auto flex size-14 items-center justify-center rounded-full">
        <Lock className="text-primary-foreground size-6" />
      </span>
      <h2 className="font-display mt-5 text-3xl font-semibold">
        {isPastDue ? "Sua assinatura está em atraso" : "Assinatura necessária"}
      </h2>
      <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-relaxed">
        {isPastDue
          ? "Sua conta continua ativa, mas os devocionais ficam bloqueados até a regularização do pagamento."
          : "Ainda não encontramos uma assinatura ativa para o seu e-mail. Assine para liberar os devocionais diários."}
      </p>
      <Button asChild size="lg" className="bg-grace mt-7 rounded-full px-8">
        <a href={KIWIFY_CHECKOUT_URL} target="_blank" rel="noreferrer">
          {isPastDue ? "Regularizar pagamento" : "Assinar agora"}
        </a>
      </Button>
    </div>
  );
}

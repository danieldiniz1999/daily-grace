import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenText, Lock, Sparkles } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useDevotionals, useIsAdmin, useProfile, useSubscription } from "@/hooks/useAppData";
import { KIWIFY_CHECKOUT_URL } from "@/lib/config";
import { formatLong, formatShort, monthLabel, todayISO } from "@/lib/date";

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

function DevocionaisPage() {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin(user?.id);
  const { data: profile } = useProfile(user?.id);
  const { data: subscription, isLoading: loadingSub } = useSubscription(user?.id);
  const { data: devotionals, isLoading } = useDevotionals();

  const today = todayISO();
  const list = devotionals ?? [];
  const todayDev = list.find((d) => d.publish_date === today);
  const history = list.filter((d) => d.publish_date !== today);
  const blocked = !loadingSub && subscription?.status !== "active" && !isAdmin;

  const firstName = (profile?.full_name ?? "").split(" ")[0];

  const groups = history.reduce<Record<string, typeof history>>((acc, d) => {
    const key = monthLabel(d.publish_date);
    (acc[key] ||= []).push(d);
    return acc;
  }, {});

  return (
    <AppShell isAdmin={isAdmin}>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">{formatLong(today)}</p>
        <h1 className="font-display mt-1 text-4xl font-semibold">
          {firstName ? `Olá, ${firstName}` : "Bem-vinda"} <span className="text-grace">✦</span>
        </h1>
      </div>

      {blocked ? (
        <BlockedState status={subscription?.status} />
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-52 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {todayDev ? (
            <Link
              to="/devocional/$date"
              params={{ date: todayDev.publish_date }}
              className="bg-grace group block rounded-[2rem] p-8 shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-[11px] font-semibold tracking-wide text-cream-foreground uppercase">
                <Sparkles className="size-3" /> Devocional de hoje
              </span>
              <h2 className="font-display mt-4 text-3xl leading-tight font-semibold text-primary-foreground text-balance sm:text-4xl">
                {todayDev.title}
              </h2>
              <p className="mt-3 text-primary-foreground/85 italic">
                “{todayDev.verse_text}” — {todayDev.verse_reference}
              </p>
              <span className="mt-6 inline-flex rounded-full bg-background/95 px-6 py-2.5 text-sm font-medium text-primary">
                Ler agora
              </span>
            </Link>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-primary/30 bg-card/70 p-10 text-center">
              <BookOpenText className="mx-auto size-8 text-primary" />
              <h2 className="font-display mt-3 text-2xl font-semibold">
                O devocional de hoje ainda está sendo preparado
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Volte em instantes — ele será liberado ainda hoje.
              </p>
            </div>
          )}

          <section className="mt-12">
            <h3 className="font-display text-2xl font-semibold">Meu acervo</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Todos os devocionais já liberados para você.
            </p>

            {history.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
                Seu acervo começa hoje. A cada dia um novo devocional entra aqui. 💜
              </p>
            ) : (
              <div className="mt-6 space-y-8">
                {Object.entries(groups).map(([mes, itens]) => (
                  <div key={mes}>
                    <h4 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      {mes}
                    </h4>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {itens.map((d) => (
                        <Link
                          key={d.id}
                          to="/devocional/$date"
                          params={{ date: d.publish_date }}
                          className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card transition-colors hover:border-primary/40"
                        >
                          <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary text-xs font-semibold text-secondary-foreground">
                            {formatShort(d.publish_date)}
                          </span>
                          <span className="min-w-0">
                            <span className="font-display block text-lg leading-snug font-semibold">
                              {d.title}
                            </span>
                            <span className="mt-1 block truncate text-xs text-muted-foreground">
                              {d.verse_reference}
                            </span>
                          </span>
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
    <div className="rounded-[2rem] border border-border/60 bg-card p-10 text-center shadow-soft">
      <span className="bg-grace mx-auto flex size-14 items-center justify-center rounded-full">
        <Lock className="size-6 text-primary-foreground" />
      </span>
      <h2 className="font-display mt-5 text-3xl font-semibold">
        {isPastDue ? "Sua assinatura está em atraso" : "Assinatura necessária"}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
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

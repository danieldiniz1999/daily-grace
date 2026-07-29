import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAppData";
import { supabase } from "@/integrations/supabase/client";
import { formatLong } from "@/lib/date";

export const Route = createFileRoute("/_authenticated/devocional/$date")({
  head: () => ({
    meta: [
      { title: "Devocional do dia | Daily Grace" },
      { name: "description", content: "Leia o devocional do dia: versículo, reflexão e oração." },
      { property: "og:title", content: "Devocional do dia | Daily Grace" },
      { property: "og:description", content: "Versículo, reflexão e oração para o seu dia." },
    ],
  }),
  component: DevocionalPage,
});

function DevocionalPage() {
  const { date } = Route.useParams();
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin(user?.id);

  const { data, isLoading } = useQuery({
    queryKey: ["devotional", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devotionals")
        .select("*")
        .eq("publish_date", date)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return (
    <AppShell isAdmin={isAdmin}>
      <Link
        to="/devocionais"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar
      </Link>

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-[2rem]" />
      ) : !data ? (
        <div className="rounded-[2rem] border border-border/60 bg-card p-10 text-center shadow-soft">
          <Lock className="mx-auto size-7 text-primary" />
          <h1 className="font-display mt-4 text-3xl font-semibold">Devocional bloqueado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este devocional ainda não foi liberado para você ou não faz parte do seu período de
            acesso.
          </p>
        </div>
      ) : (
        <article className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-soft">
          <header className="bg-grace px-8 py-10">
            <p className="text-xs tracking-widest text-primary-foreground/80 uppercase">
              {formatLong(data.publish_date)}
            </p>
            <h1 className="font-display mt-3 text-4xl leading-tight font-semibold text-primary-foreground text-balance">
              {data.title}
            </h1>
          </header>

          <div className="px-6 py-8 sm:px-10">
            <blockquote className="rounded-2xl border-l-4 border-primary bg-cream/60 px-6 py-5">
              <p className="font-display text-xl leading-relaxed text-cream-foreground italic">
                “{data.verse_text}”
              </p>
              <cite className="mt-2 block text-sm font-semibold text-primary not-italic">
                {data.verse_reference}
              </cite>
            </blockquote>

            <div className="mt-8 space-y-5 text-[1.05rem] leading-relaxed text-foreground/90">
              {data.content.split("\n").map((p, i) =>
                p.trim() ? (
                  <p key={i} className="whitespace-pre-wrap">
                    {p}
                  </p>
                ) : null,
              )}
            </div>

            {data.reflection_question && (
              <div className="mt-10 rounded-2xl border border-border/70 bg-secondary/60 p-6">
                <h2 className="font-display text-xl font-semibold">Para refletir</h2>
                <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">
                  {data.reflection_question}
                </p>
              </div>
            )}

            {data.prayer && (
              <div className="mt-6 rounded-2xl border border-primary/20 p-6">
                <h2 className="font-display text-xl font-semibold">Oração</h2>
                <p className="mt-2 leading-relaxed whitespace-pre-wrap text-foreground/90 italic">
                  {data.prayer}
                </p>
              </div>
            )}
          </div>
        </article>
      )}
    </AppShell>
  );
}

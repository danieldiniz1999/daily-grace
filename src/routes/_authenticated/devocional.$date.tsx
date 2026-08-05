import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Circle, Lock } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCompletions, useIsAdmin } from "@/hooks/useAppData";
import { supabase } from "@/integrations/supabase/client";
import { formatLong } from "@/lib/date";
import { toast } from "sonner";



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
  const queryClient = useQueryClient();

  // Se a lista já foi carregada, mostramos o devocional na hora (sem esperar rede)
  const cached = (
    queryClient.getQueryData<{ publish_date: string }[]>(["devotionals"]) ?? []
  ).find((d) => d.publish_date === date);

  const { data, isLoading } = useQuery({
    queryKey: ["devotional", date],
    initialData: cached as never,
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

  const { data: completions } = useCompletions(user?.id);

  const isCompleted = data?.id && completions?.has(data.id);

  const toggleCompletion = useMutation({
    mutationFn: async () => {
      if (!user || !data) return;
      if (isCompleted) {
        const { error } = await supabase
          .from("devotional_completions")
          .delete()
          .eq("user_id", user.id)
          .eq("devotional_id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("devotional_completions").insert({
          user_id: user.id,
          devotional_id: data.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["completions", user?.id] });
      toast.success(isCompleted ? "Marcado como não lido" : "Devocional concluído! 🎉");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
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
              {data.content.split("\n").map((p: string, i: number) =>
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

            <div className="mt-12 flex justify-center border-t border-border/40 pt-10">
              <Button
                onClick={() => toggleCompletion.mutate()}
                disabled={toggleCompletion.isPending}
                variant={isCompleted ? "outline" : "default"}
                size="lg"
                className={`rounded-full px-8 py-6 text-lg transition-all active:scale-95 ${
                  isCompleted 
                    ? "border-primary/30 text-primary hover:bg-primary/5" 
                    : "bg-grace hover:opacity-90 shadow-md"
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="mr-2 size-6" /> Concluído
                  </>
                ) : (
                  <>
                    <Circle className="mr-2 size-6" /> Marcar como concluído
                  </>
                )}
              </Button>
            </div>
          </div>
        </article>

      )}
    </AppShell>
  );
}

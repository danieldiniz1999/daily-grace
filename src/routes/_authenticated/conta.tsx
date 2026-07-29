import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarCheck, CircleAlert, CircleCheck, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin, useProfile, useSubscription } from "@/hooks/useAppData";
import { claimFirstAdmin } from "@/lib/admin.functions";
import { KIWIFY_CHECKOUT_URL } from "@/lib/config";
import { monthLabel } from "@/lib/date";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({
    meta: [
      { title: "Minha conta | Daily Grace" },
      { name: "description", content: "Veja os dados da sua conta e da sua assinatura." },
      { property: "og:title", content: "Minha conta | Daily Grace" },
      { property: "og:description", content: "Gerencie sua assinatura Daily Grace." },
    ],
  }),
  component: ContaPage,
});

const statusInfo: Record<string, { label: string; icon: typeof CircleCheck; tone: string }> = {
  active: { label: "Assinatura ativa", icon: CircleCheck, tone: "text-primary" },
  past_due: { label: "Pagamento em atraso", icon: CircleAlert, tone: "text-destructive" },
  canceled: { label: "Assinatura cancelada", icon: CircleAlert, tone: "text-destructive" },
};

function ContaPage() {
  const { user } = useAuth();
  const { data: isAdmin, refetch } = useIsAdmin(user?.id);
  const { data: profile } = useProfile(user?.id);
  const { data: sub } = useSubscription(user?.id);

  const claim = useServerFn(claimFirstAdmin);
  const claimMutation = useMutation({
    mutationFn: () => claim({ data: undefined }),
    onSuccess: () => {
      toast.success("Você agora é administradora!");
      refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const info = sub ? statusInfo[sub.status] : undefined;
  const Icon = info?.icon ?? CircleAlert;

  return (
    <AppShell isAdmin={isAdmin}>
      <h1 className="font-display text-4xl font-semibold">Minha conta</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card">
          <h2 className="font-display text-xl font-semibold">Seus dados</h2>
          <p className="mt-4 text-sm text-muted-foreground">Nome</p>
          <p className="font-medium">{profile?.full_name ?? "—"}</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4" /> E-mail
          </p>
          <p className="font-medium break-all">{profile?.email ?? user?.email}</p>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card">
          <h2 className="font-display text-xl font-semibold">Assinatura</h2>
          <p className={`mt-4 flex items-center gap-2 font-medium ${info?.tone ?? "text-muted-foreground"}`}>
            <Icon className="size-5" />
            {info?.label ?? "Nenhuma assinatura encontrada"}
          </p>
          {sub && (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarCheck className="size-4" />
              Acesso a partir de {monthLabel(sub.started_at.slice(0, 10))}
            </p>
          )}
          {sub?.status !== "active" && (
            <Button asChild className="bg-grace mt-5 rounded-full">
              <a href={KIWIFY_CHECKOUT_URL} target="_blank" rel="noreferrer">
                Ativar assinatura
              </a>
            </Button>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className="mt-6 rounded-3xl border border-dashed border-primary/30 p-6">
          <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
            <ShieldCheck className="size-5 text-primary" /> Acesso administrativo
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Se você é a responsável pelo app e ainda não existe nenhuma administradora, assuma o
            acesso administrativo aqui.
          </p>
          <Button
            variant="outline"
            className="mt-4 rounded-full"
            disabled={claimMutation.isPending}
            onClick={() => claimMutation.mutate()}
          >
            Tornar-me administradora
          </Button>
        </div>
      )}
    </AppShell>
  );
}

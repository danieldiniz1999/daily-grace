import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  CircleAlert,
  CircleCheck,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";


import { AppShell } from "@/components/AppShell";
import { AvatarUpload } from "@/components/AvatarUpload";
import { BibleVersionSelect } from "@/components/BibleVersionSelect";
import { PasswordChangeDialog } from "@/components/PasswordChangeDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin, useProfile, useSubscription } from "@/hooks/useAppData";
import { claimFirstAdmin } from "@/lib/admin.functions";
import { updateProfile } from "@/lib/account.functions";
import { KIWIFY_CHECKOUT_URL } from "@/lib/config";
import { monthLabel } from "@/lib/date";
import { formatPhone } from "@/lib/format";
import { cn } from "@/lib/utils";

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

const statusInfo: Record<string, { label: string; icon: typeof CircleCheck; tone: string; desc: string }> = {
  active: {
    label: "Assinatura ativa",
    icon: CircleCheck,
    tone: "text-primary",
    desc: "Você tem acesso a todos os devocionais liberados do seu período.",
  },
  past_due: {
    label: "Pagamento em atraso",
    icon: CircleAlert,
    tone: "text-destructive",
    desc: "Renove sua assinatura para continuar acessando o conteúdo.",
  },
  canceled: {
    label: "Assinatura cancelada",
    icon: CircleAlert,
    tone: "text-destructive",
    desc: "Renove sua assinatura para voltar a acessar os devocionais.",
  },
};

function ContaPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const { data: isAdmin, refetch } = useIsAdmin(userId);
  const { data: profile } = useProfile(userId);
  const { data: sub } = useSubscription(userId);

  const doUpdate = useServerFn(updateProfile);
  type ProfileUpdatePayload = {
    full_name?: string;
    phone?: string | null;
    notification_enabled?: boolean;
    preferred_bible_version?: string;
  };
  const updateMutation = useMutation({
    mutationFn: (payload: ProfileUpdatePayload) =>
      doUpdate({ data: payload } as Parameters<typeof doUpdate>[0]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("Dados salvos!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const claim = useServerFn(claimFirstAdmin);
  const claimMutation = useMutation({
    mutationFn: () => claim({ data: undefined }),
    onSuccess: () => {
      toast.success("Você agora é administradora!");
      refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [notify, setNotify] = useState(profile?.notification_enabled ?? true);
  const [bibleVersion, setBibleVersion] = useState(profile?.preferred_bible_version ?? "nvt");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
    setNotify(profile.notification_enabled ?? true);
    setBibleVersion(profile.preferred_bible_version ?? "nvt");
    setAvatarUrl(profile.avatar_url ?? "");
  }, [profile]);

  const info = sub ? statusInfo[sub.status] : undefined;
  const Icon = info?.icon ?? CircleAlert;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    
    // Solicitar permissão de notificação se ativado
    if (notify && Notification.permission !== "granted") {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const registration = await navigator.serviceWorker.ready;
          const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
          if (publicKey) {
            const sub = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: publicKey,
            });
            await supabase.from("push_subscriptions").upsert({
              user_id: userId,
              subscription_json: sub.toJSON() as any,
            }, { onConflict: "user_id" });
          }
        }
      } catch (err) {
        console.error("Erro ao assinar push:", err);
      }
    }

    updateMutation.mutate({
      full_name: fullName,
      phone: phone.replace(/\D/g, "") || null,
      notification_enabled: notify,
      preferred_bible_version: bibleVersion,
    });
  }


  return (
    <AppShell isAdmin={isAdmin} avatarUrl={avatarUrl}>
      <h1 className="font-display text-3xl font-semibold md:text-4xl">Minha conta</h1>
      <p className="mt-2 text-sm text-muted-foreground">Gerencie seus dados, preferências e assinatura.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border/60 bg-card shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-xl font-semibold">Dados pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-5">
                <AvatarUpload
                  url={avatarUrl}
                  name={fullName || profile?.full_name}
                  onUploaded={(url) => {
                    setAvatarUrl(url);
                    queryClient.invalidateQueries({ queryKey: ["profile", userId] });
                  }}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Seu nome"
                        className="rounded-xl pl-9"
                        maxLength={120}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">WhatsApp / Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formatPhone(phone)}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="(00) 00000-0000"
                        className="rounded-xl pl-9"
                        maxLength={15}
                        inputMode="tel"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={profile?.email ?? user?.email ?? ""}
                      disabled
                      className="rounded-xl bg-muted pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado aqui.</p>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
                      <Bell className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Receber lembretes</p>
                      <p className="text-xs text-muted-foreground">Avisos de novos devocionais</p>
                    </div>
                  </div>
                  <Switch
                    checked={notify}
                    onCheckedChange={(checked) => {
                      setNotify(checked);
                      updateMutation.mutate({ notification_enabled: checked });
                    }}
                    aria-label="Receber lembretes"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bible" className="flex items-center gap-2">
                    <BookOpen className="size-4" /> Versão bíblica padrão
                  </Label>
                  <BibleVersionSelect
                    value={bibleVersion}
                    onChange={(value) => {
                      setBibleVersion(value);
                      updateMutation.mutate({ preferred_bible_version: value });
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Usada na Bíblia e nos devocionais.</p>
                </div>

                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="rounded-full bg-gradient-to-r from-[#CB6CE6] to-[#A740C4] px-6 text-white"
                >
                  <Save className="mr-2 size-4" />
                  {updateMutation.isPending ? "Salvando..." : "Salvar dados"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {!isAdmin && (
            <Card className="border-dashed border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
                  <ShieldCheck className="size-5 text-primary" /> Acesso administrativo
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Se você é a responsável pelo app e ainda não existe nenhuma administradora, assuma o
                  acesso administrativo aqui.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-full border-primary/30"
                  disabled={claimMutation.isPending}
                  onClick={() => claimMutation.mutate()}
                >
                  Tornar-me administradora
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna lateral */}
        <div className="space-y-6">
          <Card className={cn("border-border/60 bg-card shadow-card", !info && "border-dashed")}>
            <CardHeader>
              <CardTitle className="font-display text-xl font-semibold">Assinatura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn("flex items-center gap-2 font-medium", info?.tone ?? "text-muted-foreground")}>
                <Icon className="size-5" />
                {info?.label ?? "Nenhuma assinatura encontrada"}
              </div>
              <p className="text-sm text-muted-foreground">{info?.desc ?? "Assine para começar a receber os devocionais."}</p>
              {sub && (
                <div className="rounded-2xl bg-muted/40 p-4">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarCheck className="size-4" />
                    Acesso a partir de {monthLabel(sub.started_at.slice(0, 10))}
                  </p>
                </div>
              )}
              {sub?.status !== "active" && (
                <Button asChild className="w-full rounded-full bg-grace">
                  <a href={KIWIFY_CHECKOUT_URL} target="_blank" rel="noreferrer">
                    Ativar assinatura
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-xl font-semibold">Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Altere sua senha de acesso ao app quando quiser.
              </p>
              <PasswordChangeDialog />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

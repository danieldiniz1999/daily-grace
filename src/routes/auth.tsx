import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { KIWIFY_CHECKOUT_URL } from "@/lib/config";
import logoAsset from "@/assets/daily-grace-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar | Daily Grace" },
      {
        name: "description",
        content: "Acesse sua conta Daily Grace e leia o devocional de hoje.",
      },
      { property: "og:title", content: "Entrar no Daily Grace" },
      { property: "og:description", content: "Acesse sua área de devocionais diários." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/devocionais", replace: true });
    });
  }, [navigate]);

  /** Aceita e-mail completo ou apenas o nome de usuário. */
  function resolveEmail(value: string) {
    const v = value.trim().toLowerCase();
    return v.includes("@") ? v : `${v}@dailygrace.app`;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: resolveEmail(email),
      password,
    });
    setLoading(false);
    if (error) return toast.error("Não conseguimos entrar: verifique e-mail e senha.");
    navigate({ to: "/devocionais", replace: true });
  }

  async function handleReset() {
    if (!email.trim()) return toast.error("Digite seu e-mail primeiro.");
    const { error } = await supabase.auth.resetPasswordForEmail(resolveEmail(email), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(error.message);
    toast.success("Enviamos um link de redefinição para o seu e-mail.");
  }


  return (
    <div className="bg-soft flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <img src={logoAsset.url} alt="Daily Grace" className="size-11 object-contain" />
        <span className="font-display text-3xl font-semibold tracking-tight">Daily Grace</span>
      </Link>

      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-7 shadow-soft">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-semibold">Entrar na minha conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use o e-mail da sua compra na Kiwify.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="text"
              autoComplete="username"
              required
              value={email}

              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="bg-grace w-full rounded-full py-6 text-base"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Esqueci minha senha
          </button>
        </form>

        <p className="mt-6 rounded-2xl bg-secondary/60 p-4 text-center text-xs leading-relaxed text-muted-foreground">
          Comprou agora? Sua conta é criada automaticamente após a confirmação do pagamento. Você
          recebe um e-mail para definir sua senha.
        </p>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Ainda não é assinante?{" "}
        <a
          href={KIWIFY_CHECKOUT_URL}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary hover:underline"
        >
          Assine aqui
        </a>
      </p>
    </div>
  );
}


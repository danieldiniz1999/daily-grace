import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [name, setName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/devocionais", replace: true });
    });
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error("Não conseguimos entrar: verifique e-mail e senha.");
    navigate({ to: "/devocionais", replace: true });
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada! Você já pode entrar.");
  }

  async function handleReset() {
    if (!email) return toast.error("Digite seu e-mail primeiro.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
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
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 rounded-full bg-secondary p-1">
            <TabsTrigger value="login" className="rounded-full">
              Entrar
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-full">
              Criar conta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
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
                  placeholder="••••••••"
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
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email2">E-mail da compra</Label>
                <Input
                  id="email2"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password2">Senha</Label>
                <Input
                  id="password2"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-grace w-full rounded-full py-6 text-base"
              >
                {loading ? "Criando..." : "Criar minha conta"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Use o mesmo e-mail da sua compra na Kiwify para liberar o acesso.
              </p>
            </form>
          </TabsContent>
        </Tabs>
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

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nova senha | Daily Grace" },
      { name: "description", content: "Defina uma nova senha para sua conta Daily Grace." },
      { property: "og:title", content: "Nova senha | Daily Grace" },
      { property: "og:description", content: "Redefina sua senha de acesso ao Daily Grace." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return toast.error(error.message);
    toast.success("Senha atualizada!");
    navigate({ to: "/devocionais", replace: true });
  }

  return (
    <div className="bg-soft flex min-h-screen items-center justify-center px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-3xl border border-border/60 bg-card p-7 shadow-soft"
      >
        <h1 className="font-display text-3xl font-semibold">Definir nova senha</h1>
        {!ready && (
          <p className="text-sm text-muted-foreground">
            Abra esta página pelo link enviado no seu e-mail.
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="np">Nova senha</Label>
          <Input
            id="np"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={!ready} className="bg-grace w-full rounded-full py-6">
          Salvar senha
        </Button>
      </form>
    </div>
  );
}

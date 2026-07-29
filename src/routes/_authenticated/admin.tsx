import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAppData";
import { supabase } from "@/integrations/supabase/client";
import { formatLong, todayISO } from "@/lib/date";

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

const emptyForm = (): FormState => ({
  publish_date: todayISO(),
  title: "",
  verse_reference: "",
  verse_text: "",
  content: "",
  reflection_question: "",
  prayer: "",
});

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
      <h1 className="font-display text-4xl font-semibold">Administração</h1>
      <Tabs defaultValue="devocionais" className="mt-6">
        <TabsList className="rounded-full bg-secondary p-1">
          <TabsTrigger value="devocionais" className="rounded-full px-5">
            Devocionais
          </TabsTrigger>
          <TabsTrigger value="assinantes" className="rounded-full px-5">
            Assinantes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="devocionais" className="mt-6">
          <DevotionalsAdmin />
        </TabsContent>
        <TabsContent value="assinantes" className="mt-6">
          <SubscribersAdmin />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function DevotionalsAdmin() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: list } = useQuery({
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

  const save = useMutation({
    mutationFn: async (values: FormState) => {
      const payload = {
        publish_date: values.publish_date,
        title: values.title,
        verse_reference: values.verse_reference,
        verse_text: values.verse_text,
        content: values.content,
        reflection_question: values.reflection_question || null,
        prayer: values.prayer || null,
      };
      const query = values.id
        ? supabase.from("devotionals").update(payload).eq("id", values.id)
        : supabase.from("devotionals").insert(payload);
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Devocional salvo!");
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
  });

  const set = (k: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(form);
        }}
        className="space-y-4 rounded-3xl border border-border/60 bg-card p-6 shadow-card"
      >
        <h2 className="font-display text-xl font-semibold">
          {form.id ? "Editar devocional" : "Novo devocional"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Data de liberação</Label>
            <Input type="date" required value={form.publish_date} onChange={set("publish_date")} />
          </div>
          <div className="space-y-2">
            <Label>Referência</Label>
            <Input
              required
              placeholder="Salmos 23:1"
              value={form.verse_reference}
              onChange={set("verse_reference")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Título</Label>
          <Input required value={form.title} onChange={set("title")} />
        </div>

        <div className="space-y-2">
          <Label>Versículo</Label>
          <Textarea required rows={2} value={form.verse_text} onChange={set("verse_text")} />
        </div>

        <div className="space-y-2">
          <Label>Mensagem</Label>
          <Textarea required rows={8} value={form.content} onChange={set("content")} />
        </div>

        <div className="space-y-2">
          <Label>Pergunta para refletir (opcional)</Label>
          <Textarea
            rows={2}
            value={form.reflection_question}
            onChange={set("reflection_question")}
          />
        </div>

        <div className="space-y-2">
          <Label>Oração (opcional)</Label>
          <Textarea rows={4} value={form.prayer} onChange={set("prayer")} />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={save.isPending} className="bg-grace rounded-full px-6">
            <Plus className="size-4" /> {form.id ? "Salvar alterações" : "Publicar devocional"}
          </Button>
          {form.id && (
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setForm(emptyForm())}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Publicados</h2>
        {(list ?? []).map((d) => (
          <div
            key={d.id}
            className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4"
          >
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{formatLong(d.publish_date)}</p>
              <p className="font-display truncate text-lg font-semibold">{d.title}</p>
              <p className="truncate text-xs text-muted-foreground">{d.verse_reference}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  setForm({
                    id: d.id,
                    publish_date: d.publish_date,
                    title: d.title,
                    verse_reference: d.verse_reference,
                    verse_text: d.verse_text,
                    content: d.content,
                    reflection_question: d.reflection_question ?? "",
                    prayer: d.prayer ?? "",
                  })
                }
              >
                <Pencil className="size-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => remove.mutate(d.id)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {list?.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum devocional cadastrado ainda.</p>
        )}
      </div>
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
    <div className="space-y-3">
      {(data ?? []).map((s) => (
        <div
          key={s.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4"
        >
          <div className="min-w-0">
            <p className="font-medium">{s.profile?.full_name ?? "Sem nome"}</p>
            <p className="text-xs break-all text-muted-foreground">
              {s.profile?.email ?? s.kiwify_customer_email}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Compra: {formatLong(s.started_at.slice(0, 10))}
            </p>
          </div>
          <Select
            value={s.status}
            onValueChange={(v) =>
              update.mutate({ id: s.id, status: v as "active" | "past_due" | "canceled" })
            }
          >
            <SelectTrigger className="w-44 rounded-full">
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
        <p className="text-sm text-muted-foreground">Nenhuma assinante ainda.</p>
      )}
    </div>
  );
}

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Eye, EyeOff, Lock, X } from "lucide-react";
import { toast } from "sonner";

import { changePassword } from "@/lib/account.functions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordChangeDialog() {
  const doChange = useServerFn(changePassword);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const mutation = useMutation({
    mutationFn: () => {
      if (next !== confirm) throw new Error("As novas senhas não coincidem.");
      return doChange({ data: { currentPassword: current, newPassword: next } });
    },
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setCurrent("");
      setNext("");
      setConfirm("");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full border-primary/30 text-primary hover:bg-primary/10">
          <Lock className="mr-2 size-4" />
          Alterar senha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Alterar senha</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="mt-2 space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="current">Senha atual</Label>
            <div className="relative">
              <Input
                id="current"
                type={showCurrent ? "text" : "password"}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                className="rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute inset-y-0 right-3 text-muted-foreground"
                aria-label={showCurrent ? "Ocultar senha" : "Mostrar senha"}
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new">Nova senha</Label>
            <div className="relative">
              <Input
                id="new"
                type={showNext ? "text" : "password"}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
                minLength={6}
                className="rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNext((s) => !s)}
                className="absolute inset-y-0 right-3 text-muted-foreground"
                aria-label={showNext ? "Ocultar senha" : "Mostrar senha"}
              >
                {showNext ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirmar nova senha</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className="rounded-xl"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-[#CB6CE6] to-[#A740C4] text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

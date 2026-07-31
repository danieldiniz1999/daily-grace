import { Camera, Loader2, User } from "lucide-react";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { uploadAvatar } from "@/lib/account.functions";
import { cn } from "@/lib/utils";

export function AvatarUpload({
  url,
  name,
  onUploaded,
  className,
}: {
  url?: string | null;
  name?: string | null;
  onUploaded: (url: string) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const doUpload = useServerFn(uploadAvatar);
  const [preview, setPreview] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return doUpload({ data: formData });
    },
    onSuccess: (res) => {
      setPreview(null);
      onUploaded(res.avatarUrl);
      toast.success("Foto atualizada com sucesso!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Escolha uma imagem (JPG, PNG ou WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5 MB.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    mutation.mutate(file);
  }

  const initials = (name ?? "")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const imageSrc = preview || url;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={mutation.isPending}
        className="group relative flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary/40 bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Trocar foto de perfil"
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Foto de perfil"
            className="h-full w-full object-cover"
          />
        ) : initials ? (
          <span className="text-xl font-semibold text-primary">{initials}</span>
        ) : (
          <User className="size-8 text-muted-foreground" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
          {mutation.isPending ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
        </span>
      </button>
      <div>
        <p className="font-medium">Foto de perfil</p>
        <p className="text-sm text-muted-foreground">Clique para enviar uma imagem (máx. 5 MB)</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

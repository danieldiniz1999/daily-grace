import { useState, useRef } from "react";
import { X, Share2, Check, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/daily-grace-logo.png.asset.json";
import * as htmlToImage from 'html-to-image';

interface DailyPhraseModalProps {
  isOpen: boolean;
  onClose: () => void;
  phrase: string;
  author: string;
  devotionalId: string;
  isCompleted?: boolean;
  userId?: string;
  bgUrl?: string | null;
}

export function DailyPhraseModal({
  isOpen,
  onClose,
  phrase,
  author,
  devotionalId,
  isCompleted,
  userId,
  bgUrl
}: DailyPhraseModalProps) {
  const queryClient = useQueryClient();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const toggleCompletion = useMutation({
    mutationFn: async () => {
      if (!userId || !devotionalId) return;
      if (isCompleted) {
        const { error } = await supabase
          .from("devotional_completions")
          .delete()
          .eq("user_id", userId)
          .eq("devotional_id", devotionalId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("devotional_completions").insert({
          user_id: userId,
          devotional_id: devotionalId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["completions", userId] });
      toast.success(isCompleted ? "Marcado como não lido" : "Frase concluída! ✨");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });

  const handleShare = async () => {
    if (!cardRef.current) return;
    
    setIsCapturing(true);
    try {
      // Pequeno delay para garantir que o DOM está pronto e animações terminadas
      await new Promise(r => setTimeout(r, 100));
      
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "daily-grace-frase.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Frase do Dia - Daily Grace",
        });
      } else {
        const link = document.createElement('a');
        link.download = 'daily-grace-frase.png';
        link.href = dataUrl;
        link.click();
        toast.success("Imagem baixada para compartilhar!");
      }
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
      toast.error("Não foi possível gerar a imagem para compartilhar.");
    } finally {
      setIsCapturing(false);
    }
  };

  const finalBgUrl = bgUrl || "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=2070";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col bg-black"
        >
          {/* Container para Captura (Glorify Style) */}
          <div 
            ref={cardRef}
            className="relative flex h-full w-full flex-col overflow-hidden bg-black"
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img 
                src={finalBgUrl} 
                className="h-full w-full object-cover opacity-60"
                alt="Fundo"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 flex h-full flex-col px-8 py-16">
              {/* Header com Logo - Centralizado como no Glorify */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <img 
                  src={logoAsset.url} 
                  alt="Daily Grace" 
                  className="size-12 object-contain brightness-0 invert" 
                />
                <h3 className="font-display text-sm font-bold tracking-[0.3em] text-white/70 uppercase">
                  DAILY GRACE
                </h3>
              </div>

              {/* Phrase & Author - Centralizado no meio da tela */}
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="max-w-xs md:max-w-md">
                  <p className="font-display text-2xl leading-[1.6] text-white md:text-3xl italic">
                    "{phrase}"
                  </p>
                  
                  <div className="mt-10 flex flex-col items-center gap-4">
                    <div className="h-px w-8 bg-white/40" />
                    <p className="font-display text-base font-bold tracking-[0.2em] text-white/90 uppercase">
                      {author}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer text invisible during capture? No, usually it stays */}
              {!isCapturing && (
                <div className="mt-auto opacity-0 h-0">Selo de captura</div>
              )}
            </div>
          </div>

          {/* UI Controls - Overlay que não entra na captura */}
          <div className="absolute inset-0 z-20 pointer-events-none flex flex-col px-6 py-12">
            <div className="flex justify-end pointer-events-auto">
              <button 
                onClick={onClose}
                className="rounded-full bg-black/40 p-2.5 text-white backdrop-blur-md transition-colors hover:bg-black/60"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="mt-auto space-y-4 pointer-events-auto">
              <Button
                onClick={handleShare}
                disabled={isCapturing}
                className="w-full bg-white py-7 text-lg font-bold text-black hover:bg-white/90 shadow-2xl"
              >
                {isCapturing ? (
                  <span className="flex items-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    GERANDO IMAGEM...
                  </span>
                ) : (
                  <>
                    <Share2 className="mr-2 size-5" />
                    COMPARTILHAR CITAÇÃO
                  </>
                )}
              </Button>

              <button
                onClick={() => toggleCompletion.mutate()}
                disabled={toggleCompletion.isPending}
                className="w-full py-4 text-sm font-bold tracking-widest text-white/80 transition-colors hover:text-white uppercase drop-shadow-md"
              >
                {isCompleted ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="size-5 text-white" /> CONCLUÍDO
                  </span>
                ) : (
                  "TOQUE AQUI PARA CONCLUIR"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

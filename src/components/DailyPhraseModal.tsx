import { useState, useRef } from "react";
import { X, Share2, Check, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DailyPhraseModalProps {
  isOpen: boolean;
  onClose: () => void;
  phrase: string;
  author: string;
  devotionalId: string;
  isCompleted?: boolean;
  userId?: string;
}

export function DailyPhraseModal({
  isOpen,
  onClose,
  phrase,
  author,
  devotionalId,
  isCompleted,
  userId
}: DailyPhraseModalProps) {
  const queryClient = useQueryClient();
  const cardRef = useRef<HTMLDivElement>(null);

  const toggleCompletion = useMutation({
    mutationFn: async () => {
      if (!userId || !devotionalId) return;
      // Nota: Estamos usando a mesma tabela de conclusão de devocionais para a frase
      // No futuro, se quiser separar "concluiu a frase" de "concluiu o devocional", 
      // precisaria de uma nova tabela. Por enquanto, marcar a frase marca o devocional.
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
    const text = `"${phrase}" — ${author}\n\nLido no Daily Grace 💜`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Frase do Dia - Daily Grace",
          text: text,
        });
      } catch (err) {
        console.error("Erro ao compartilhar:", err);
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado para a área de transferência!");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-md"
        >
          {/* Background Image (Flores/Vibe Glorify) */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=2070" 
              className="h-full w-full object-cover opacity-40"
              alt="Fundo"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
          </div>

          <div className="relative z-10 flex h-full flex-col px-6 py-12">
            <div className="flex justify-end">
              <button 
                onClick={onClose}
                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-md"
              >
                <h3 className="mb-8 font-display text-2xl font-bold tracking-widest text-white/60 uppercase">
                  DAILY GRACE
                </h3>
                
                <p className="font-display text-2xl leading-relaxed text-white md:text-3xl">
                  {phrase}
                </p>
                
                <p className="mt-8 font-display text-lg font-semibold tracking-widest text-white/80 uppercase">
                  {author}
                </p>

                <div className="mt-12 flex justify-center">
                   <div className="h-px w-12 bg-white/30" />
                </div>
              </motion.div>
            </div>

            <div className="mt-auto space-y-4">
              <Button
                onClick={handleShare}
                className="w-full bg-white py-7 text-lg font-bold text-black hover:bg-white/90"
              >
                <Share2 className="mr-2 size-5" />
                COMPARTILHAR CITAÇÃO
              </Button>

              <button
                onClick={() => toggleCompletion.mutate()}
                disabled={toggleCompletion.isPending}
                className="w-full py-4 text-sm font-bold tracking-widest text-white/80 transition-colors hover:text-white uppercase"
              >
                {isCompleted ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="size-5 text-green-400" /> CONCLUÍDO
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

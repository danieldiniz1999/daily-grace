import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenText, Heart, Lock, Sparkles, Sunrise } from "lucide-react";

import heroImg from "@/assets/hero-devocional.jpg";
import { Button } from "@/components/ui/button";
import { KIWIFY_CHECKOUT_URL } from "@/lib/config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Daily Grace | Devocional diário para mulheres cristãs" },
      {
        name: "description",
        content:
          "Assine o Daily Grace e receba um devocional novo todos os dias: palavra, oração e reflexão para mulheres cristãs.",
      },
      { property: "og:title", content: "Daily Grace | Devocional diário feminino" },
      {
        property: "og:description",
        content: "Um novo devocional a cada manhã. Fé, propósito e paz para o seu dia.",
      },
    ],
  }),
  component: Landing,
});

const beneficios = [
  {
    icon: Sunrise,
    titulo: "Um novo a cada manhã",
    texto: "Todo dia um devocional inédito é desbloqueado para você começar o dia com Deus.",
  },
  {
    icon: BookOpenText,
    titulo: "Palavra e oração",
    texto: "Versículo, reflexão profunda e uma oração guiada em poucos minutos de leitura.",
  },
  {
    icon: Heart,
    titulo: "Feito para você",
    texto: "Conteúdo escrito com carinho para a mulher cristã, na sua rotina real.",
  },
  {
    icon: Lock,
    titulo: "Seu acervo pessoal",
    texto: "Os devocionais já liberados ficam guardados para você reler quando quiser.",
  },
];

function Landing() {
  return (
    <div className="bg-soft min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="bg-grace flex size-9 items-center justify-center rounded-full">
            <Heart className="size-4 text-primary-foreground" />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight">Daily Grace</span>
        </div>
        <Link
          to="/auth"
          className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground"
        >
          Entrar
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-6 pb-16 lg:grid-cols-2 lg:gap-16 lg:pt-14">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-1.5 text-xs font-semibold tracking-wide text-cream-foreground uppercase">
            <Sparkles className="size-3.5" /> Devocional diário feminino
          </span>
          <h1 className="font-display mt-6 text-5xl leading-[1.05] font-semibold text-balance sm:text-6xl">
            Comece cada dia <span className="text-grace">na presença</span> de Deus
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            O Daily Grace entrega, todas as manhãs, um devocional novo com versículo, reflexão e
            oração — escrito para a mulher cristã que quer viver com propósito, mesmo na correria.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-grace rounded-full px-8 text-base shadow-soft hover:opacity-90"
            >
              <a href={KIWIFY_CHECKOUT_URL} target="_blank" rel="noreferrer">
                Quero assinar
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 text-base">
              <Link to="/auth">Já sou assinante</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Acesso imediato aos devocionais do mês da sua compra em diante.
          </p>
        </div>

        <div className="relative">
          <div className="bg-grace absolute -inset-4 rounded-[2.5rem] opacity-15 blur-2xl" />
          <img
            src={heroImg}
            alt="Bíblia aberta com orquídeas, vela acesa e xícara de chá em uma manhã tranquila"
            width={1280}
            height={1600}
            className="relative aspect-4/5 w-full rounded-[2rem] object-cover shadow-soft"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {beneficios.map(({ icon: Icon, titulo, texto }) => (
            <div
              key={titulo}
              className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-card backdrop-blur"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary">
                <Icon className="size-5 text-primary" />
              </span>
              <h2 className="font-display mt-4 text-xl font-semibold">{titulo}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-24">
        <div className="bg-grace rounded-[2rem] px-8 py-14 text-center shadow-soft">
          <h2 className="font-display text-4xl font-semibold text-primary-foreground text-balance">
            "A tua palavra é lâmpada para os meus pés"
          </h2>
          <p className="mt-3 text-primary-foreground/80">Salmos 119:105</p>
          <Button
            asChild
            size="lg"
            className="mt-8 rounded-full bg-cream px-8 text-base text-cream-foreground hover:bg-cream/90"
          >
            <a href={KIWIFY_CHECKOUT_URL} target="_blank" rel="noreferrer">
              Assinar o Daily Grace
            </a>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Daily Grace — feito com fé e carinho.
      </footer>
    </div>
  );
}

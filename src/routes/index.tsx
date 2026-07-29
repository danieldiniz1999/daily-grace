import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpenText,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Gift,
  Heart,
  Lock,
  MessageCircleHeart,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Sunrise,
  X,
} from "lucide-react";

import appMockup from "@/assets/app-mockup.jpg";
import heroImg from "@/assets/hero-devocional.jpg";
import mulherOracao from "@/assets/mulher-oracao.jpg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { KIWIFY_CHECKOUT_URL } from "@/lib/config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Daily Grace | Devocional diário para mulheres cristãs" },
      {
        name: "description",
        content:
          "Assine o Daily Grace e receba um devocional novo todos os dias: versículo, reflexão e oração guiada para mulheres cristãs. Comece hoje mesmo.",
      },
      { property: "og:title", content: "Daily Grace | Devocional diário feminino" },
      {
        property: "og:description",
        content: "Um novo devocional a cada manhã. Fé, propósito e paz para o seu dia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function CTA({
  children = "Quero começar hoje",
  variant = "solid",
  className = "",
}: {
  children?: React.ReactNode;
  variant?: "solid" | "cream";
  className?: string;
}) {
  return (
    <Button
      asChild
      size="lg"
      className={`h-13 rounded-full px-8 text-base font-semibold shadow-soft transition hover:-translate-y-0.5 hover:opacity-95 ${
        variant === "cream" ? "bg-cream text-cream-foreground hover:bg-cream/90" : "bg-grace"
      } ${className}`}
    >
      <a href={KIWIFY_CHECKOUT_URL} target="_blank" rel="noreferrer">
        {children}
      </a>
    </Button>
  );
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-secondary-foreground uppercase">
      <Sparkles className="size-3.5" />
      {children}
    </span>
  );
}

const dores = [
  "Você abre a Bíblia com vontade, mas não sabe por onde começar.",
  "A correria toma conta e, quando percebe, o dia passou sem oração.",
  "Sente o coração ansioso, cansado e sem direção.",
  "Já tentou vários planos de leitura e sempre desistiu na primeira semana.",
  "Sente falta de uma palavra que fale da sua vida real: casa, filhos, trabalho, propósito.",
];

const entregas = [
  {
    icon: Sunrise,
    titulo: "Um devocional novo todo dia",
    texto:
      "Toda manhã um conteúdo inédito é desbloqueado: versículo, reflexão profunda e aplicação prática.",
  },
  {
    icon: MessageCircleHeart,
    titulo: "Oração guiada",
    texto: "Não sabe o que orar? Cada devocional termina com uma oração escrita para você repetir.",
  },
  {
    icon: Clock3,
    titulo: "Só 5 minutos por dia",
    texto: "Feito para caber na sua rotina real, entre o café, o trabalho e a casa.",
  },
  {
    icon: BookOpenText,
    titulo: "Seu acervo pessoal",
    texto: "Tudo que já foi liberado fica guardado para você reler quando o coração pedir.",
  },
  {
    icon: Heart,
    titulo: "Linguagem de mulher para mulher",
    texto: "Nada de teologia distante: palavra viva sobre ansiedade, fé, família e propósito.",
  },
  {
    icon: Lock,
    titulo: "Acesso privado e seguro",
    texto: "Login exclusivo seu, em qualquer celular ou computador, sem precisar instalar nada.",
  },
];

const passos = [
  {
    n: "01",
    titulo: "Assine em 2 minutos",
    texto: "Checkout seguro pela Kiwify. Pagamento aprovado, acesso liberado na hora.",
  },
  {
    n: "02",
    titulo: "Crie seu login",
    texto: "Você recebe o acesso e entra com e-mail e senha, direto do navegador do celular.",
  },
  {
    n: "03",
    titulo: "Leia todos os dias",
    texto: "O devocional do dia aparece na tela inicial. Um novo é desbloqueado a cada manhã.",
  },
];

const depoimentos = [
  {
    nome: "Juliana M.",
    cidade: "Belo Horizonte, MG",
    texto:
      "Eu começava o dia no celular vendo notícia ruim. Agora começo com a Palavra. Em duas semanas minha ansiedade diminuiu de um jeito que eu não sei explicar.",
  },
  {
    nome: "Patrícia R.",
    cidade: "Recife, PE",
    texto:
      "Sou mãe de três e nunca conseguia manter uma rotina de leitura. São 5 minutinhos e eu consigo. É o meu momento com Deus, todo dia, sem culpa.",
  },
  {
    nome: "Cláudia S.",
    cidade: "Curitiba, PR",
    texto:
      "As orações no final me pegam de jeito. Parece que foram escritas pra mim naquele dia exato. Já indiquei pra todas as irmãs da minha célula.",
  },
];

const bonus = [
  {
    titulo: "Guia de Oração da Mulher de Fé",
    texto: "Um roteiro simples para orar por casamento, filhos, finanças e propósito.",
  },
  {
    titulo: "30 Versículos para dias difíceis",
    texto: "Uma lista para salvar no celular e recorrer quando o medo apertar.",
  },
  {
    titulo: "Acervo crescente",
    texto: "Quanto mais tempo assinante, maior a sua biblioteca de devocionais.",
  },
];

const faq = [
  {
    q: "Como recebo o acesso depois de pagar?",
    a: "Assim que o pagamento é aprovado pela Kiwify, seu acesso é liberado automaticamente. Você cria sua senha e já entra na área da assinante.",
  },
  {
    q: "Preciso instalar algum aplicativo?",
    a: "Não. O Daily Grace funciona direto no navegador do celular, tablet ou computador. Você pode adicionar o atalho na tela inicial do celular e usar como um app.",
  },
  {
    q: "Vou ter acesso aos devocionais antigos?",
    a: "Seu acesso começa no mês da sua compra. Se você assinar no dia 20, recebe todos os devocionais daquele mês até o dia 20 e os próximos vão sendo desbloqueados nas datas certas. Meses anteriores à sua compra não fazem parte do acervo.",
  },
  {
    q: "É cobrança única ou mensal?",
    a: "É uma assinatura. Enquanto ela estiver ativa, você recebe um devocional novo todos os dias e mantém seu acervo liberado.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. O cancelamento é feito a qualquer momento, sem multa e sem burocracia, direto na sua área de assinante da Kiwify.",
  },
  {
    q: "É de alguma denominação específica?",
    a: "O conteúdo é bíblico e cristão, escrito para a mulher evangélica de qualquer igreja. O foco é a Palavra e a vida prática de fé.",
  },
];

function Landing() {
  return (
    <div className="bg-soft min-h-screen">
      {/* Barra fixa */}
      <div className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="bg-grace flex size-9 items-center justify-center rounded-full">
              <Heart className="size-4 text-primary-foreground" />
            </span>
            <span className="font-display text-2xl font-semibold tracking-tight">Daily Grace</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="rounded-full px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground"
            >
              Entrar
            </Link>
            <Button
              asChild
              className="bg-grace hidden rounded-full px-6 font-semibold sm:inline-flex"
            >
              <a href={KIWIFY_CHECKOUT_URL} target="_blank" rel="noreferrer">
                Quero assinar
              </a>
            </Button>
          </div>
        </header>
      </div>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-10 pb-14 lg:grid-cols-2 lg:gap-16 lg:pt-16">
        <div>
          <SectionTag>Devocional diário feminino</SectionTag>
          <h1 className="font-display mt-6 text-5xl leading-[1.03] font-semibold text-balance sm:text-6xl">
            Comece cada dia <span className="text-grace">na presença</span> de Deus — em apenas 5
            minutos
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            O Daily Grace desbloqueia, todas as manhãs, um devocional novo com versículo, reflexão e
            oração guiada. Escrito para a mulher cristã que quer viver com propósito, mesmo na
            correria.
          </p>

          <ul className="mt-6 space-y-2.5">
            {[
              "Um devocional inédito por dia, direto no seu celular",
              "Oração guiada para quando faltam as palavras",
              "Acesso imediato após a compra",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[15px] text-foreground/85">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <CTA>Quero meu devocional diário</CTA>
            <Button asChild size="lg" variant="outline" className="h-13 rounded-full px-8">
              <Link to="/auth">Já sou assinante</Link>
            </Button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" /> Compra segura Kiwify
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarCheck className="size-4 text-primary" /> Cancele quando quiser
            </span>
          </div>
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
          <div className="absolute right-4 bottom-4 left-4 rounded-2xl border border-border/60 bg-background/90 p-4 backdrop-blur sm:right-6 sm:left-6">
            <div className="flex items-center gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </div>
            <p className="mt-2 text-sm leading-snug text-foreground/80">
              "Virou o meu momento favorito do dia."
            </p>
          </div>
        </div>
      </section>

      {/* FAIXA DE PROVA */}
      <section className="border-y border-border/60 bg-background/60">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 text-center sm:grid-cols-3">
          {[
            { valor: "5 min", label: "por dia é tudo que você precisa" },
            { valor: "365", label: "devocionais por ano de caminhada" },
            { valor: "100%", label: "conteúdo bíblico e feito para mulheres" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-4xl font-semibold text-primary">{s.valor}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DOR */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <img
            src={mulherOracao}
            alt="Mulher orando em silêncio perto da janela"
            width={1200}
            height={900}
            loading="lazy"
            className="aspect-4/3 w-full rounded-[2rem] object-cover shadow-card"
          />
          <div>
            <SectionTag>Se identifica?</SectionTag>
            <h2 className="font-display mt-5 text-4xl leading-tight font-semibold text-balance sm:text-[2.75rem]">
              Você ama a Deus — mas o dia a dia tem roubado o seu tempo com Ele
            </h2>
            <ul className="mt-6 space-y-3">
              {dores.map((d) => (
                <li key={d} className="flex items-start gap-3 text-[15px] text-muted-foreground">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <X className="size-3 text-destructive" />
                  </span>
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-lg font-medium text-foreground">
              A culpa não é da sua fé. É da falta de um caminho simples para seguir todos os dias.
            </p>
          </div>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-[2.5rem] border border-border/60 bg-card/80 p-8 shadow-card backdrop-blur sm:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionTag>A solução</SectionTag>
              <h2 className="font-display mt-5 text-4xl leading-tight font-semibold text-balance">
                Daily Grace: sua constância com Deus, resolvida
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Chega de decidir por onde começar. Todo dia, ao acordar, já tem uma palavra
                esperando por você — curta, profunda e prática. Você abre, lê, ora e segue o dia
                diferente.
              </p>
              <div className="mt-7">
                <CTA>Quero começar agora</CTA>
              </div>
            </div>
            <img
              src={appMockup}
              alt="Celular mostrando o devocional do dia ao lado de uma Bíblia aberta"
              width={1200}
              height={1200}
              loading="lazy"
              className="aspect-square w-full rounded-[2rem] object-cover shadow-soft"
            />
          </div>
        </div>
      </section>

      {/* O QUE VOCÊ RECEBE */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="text-center">
          <SectionTag>O que você recebe</SectionTag>
          <h2 className="font-display mx-auto mt-5 max-w-2xl text-4xl leading-tight font-semibold text-balance">
            Tudo que você precisa para não perder mais um dia com Deus
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entregas.map(({ icon: Icon, titulo, texto }) => (
            <div
              key={titulo}
              className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-card backdrop-blur transition hover:-translate-y-1 hover:shadow-soft"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary">
                <Icon className="size-5 text-primary" />
              </span>
              <h3 className="font-display mt-4 text-xl font-semibold">{titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="border-y border-border/60 bg-background/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="text-center">
            <SectionTag>Como funciona</SectionTag>
            <h2 className="font-display mt-5 text-4xl font-semibold text-balance">
              Do pagamento ao primeiro devocional em 3 passos
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {passos.map((p) => (
              <div key={p.n} className="relative rounded-3xl bg-card/80 p-7 shadow-card">
                <span className="font-display bg-grace flex size-12 items-center justify-center rounded-2xl text-xl font-semibold text-primary-foreground">
                  {p.n}
                </span>
                <h3 className="font-display mt-4 text-2xl font-semibold">{p.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.texto}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Assinou no dia 20? Você recebe o mês inteiro até ali e os próximos vão abrindo dia após
            dia.
          </p>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="text-center">
          <SectionTag>Histórias reais</SectionTag>
          <h2 className="font-display mt-5 text-4xl font-semibold text-balance">
            Mulheres que voltaram a ter intimidade com Deus
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {depoimentos.map((d) => (
            <figure
              key={d.nome}
              className="flex flex-col rounded-3xl border border-border/60 bg-card/80 p-7 shadow-card"
            >
              <Quote className="size-7 text-accent" />
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground/85">
                {d.texto}
              </blockquote>
              <div className="mt-5 flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <figcaption className="mt-2 text-sm font-semibold">
                {d.nome}
                <span className="block font-normal text-muted-foreground">{d.cidade}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* BÔNUS */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-[2.5rem] bg-cream p-8 shadow-card sm:p-12">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-cream-foreground/10 px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-cream-foreground uppercase">
              <Gift className="size-3.5" /> Bônus inclusos
            </span>
            <h2 className="font-display mt-5 text-4xl font-semibold text-cream-foreground text-balance">
              Você ainda leva junto com a assinatura
            </h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {bonus.map((b) => (
              <div key={b.titulo} className="rounded-2xl bg-background/70 p-6">
                <CheckCircle2 className="size-6 text-primary" />
                <h3 className="font-display mt-3 text-xl font-semibold">{b.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFERTA */}
      <section id="oferta" className="mx-auto max-w-3xl px-5 pb-20">
        <div className="overflow-hidden rounded-[2.5rem] border border-primary/20 bg-card shadow-soft">
          <div className="bg-grace px-8 py-6 text-center">
            <p className="text-sm font-semibold tracking-[0.14em] text-primary-foreground uppercase">
              Assinatura Daily Grace
            </p>
          </div>
          <div className="px-8 py-10 text-center sm:px-12">
            <h2 className="font-display text-4xl font-semibold text-balance">
              Menos que um café por dia para caminhar com Deus
            </h2>
            <p className="mt-4 text-muted-foreground">
              Acesso completo à área da assinante, devocional novo todos os dias, acervo liberado e
              bônus inclusos.
            </p>

            <ul className="mx-auto mt-7 max-w-md space-y-2.5 text-left">
              {[
                "Devocional inédito todos os dias",
                "Versículo, reflexão e oração guiada",
                "Acervo do seu período de assinatura",
                "Guia de Oração da Mulher de Fé",
                "30 Versículos para dias difíceis",
                "Acesso no celular, tablet e computador",
              ].map((i) => (
                <li key={i} className="flex items-start gap-2.5 text-[15px]">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  {i}
                </li>
              ))}
            </ul>

            <div className="mt-9">
              <CTA className="w-full sm:w-auto">Assinar o Daily Grace</CTA>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Pagamento seguro pela Kiwify • Cancele quando quiser
            </p>
          </div>
        </div>

        {/* GARANTIA */}
        <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-border/60 bg-background/70 p-7 text-center sm:flex-row sm:text-left">
          <span className="bg-grace flex size-16 shrink-0 items-center justify-center rounded-full">
            <ShieldCheck className="size-8 text-primary-foreground" />
          </span>
          <div>
            <h3 className="font-display text-2xl font-semibold">Garantia de 7 dias</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Experimente sem risco. Se em 7 dias você sentir que o Daily Grace não é para você,
              basta pedir o reembolso e devolvemos 100% do valor. O risco é todo nosso.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 pb-20">
        <div className="text-center">
          <SectionTag>Dúvidas frequentes</SectionTag>
          <h2 className="font-display mt-5 text-4xl font-semibold text-balance">
            Ainda tem alguma pergunta?
          </h2>
        </div>
        <Accordion type="single" collapsible className="mt-8">
          {faq.map((f) => (
            <AccordionItem key={f.q} value={f.q} className="border-border/60">
              <AccordionTrigger className="text-left text-base font-semibold">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-4xl px-5 pb-24">
        <div className="bg-grace rounded-[2.5rem] px-8 py-14 text-center shadow-soft">
          <h2 className="font-display text-4xl font-semibold text-primary-foreground text-balance sm:text-5xl">
            "A tua palavra é lâmpada para os meus pés e luz para o meu caminho"
          </h2>
          <p className="mt-3 text-primary-foreground/80">Salmos 119:105</p>
          <p className="mx-auto mt-6 max-w-xl text-primary-foreground/90">
            Amanhã de manhã você pode acordar com uma palavra esperando por você. Comece hoje a sua
            caminhada diária com Deus.
          </p>
          <div className="mt-8">
            <CTA variant="cream">Quero assinar o Daily Grace</CTA>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/75">
            Acesso imediato • Garantia de 7 dias • Cancele quando quiser
          </p>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Daily Grace — feito com fé e carinho.
      </footer>

      {/* CTA fixo mobile */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 p-3 backdrop-blur sm:hidden">
        <Button
          asChild
          className="bg-grace h-12 w-full rounded-full text-base font-semibold shadow-soft"
        >
          <a href={KIWIFY_CHECKOUT_URL} target="_blank" rel="noreferrer">
            Quero assinar agora
          </a>
        </Button>
      </div>
      <div className="h-16 sm:hidden" />
    </div>
  );
}

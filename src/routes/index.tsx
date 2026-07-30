import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
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
import autoraImg from "@/assets/autora.jpg";
import depoimentoModerno from "@/assets/depoimento-moderno.jpg";
import heroUploaded from "@/assets/hero-uploaded.png.asset.json";
import mulherOracao from "@/assets/mulher-oracao.jpg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimateIn } from "@/components/animate-in";
import { Button } from "@/components/ui/button";
import { KIWIFY_CHECKOUT_URL } from "@/lib/config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Daily Grace | Devocional diário para mulheres cristãs" },
      {
        name: "description",
        content:
          "Assine o Daily Grace e receba um devocional novo todos os dias: versículo, reflexão e oração guiada para mulheres cristãs. Acesso imediato e garantia de 7 dias.",
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

/* ---------------------------------- UI ---------------------------------- */

function CTA({
  children = "Quero começar hoje",
  tone = "solid",
  className = "",
}: {
  children?: React.ReactNode;
  tone?: "solid" | "cream";
  className?: string;
}) {
  return (
    <Button
      asChild
      size="lg"
      className={`group relative h-14 overflow-hidden rounded-full px-9 text-base font-semibold tracking-tight shadow-lift transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] ${
        tone === "cream"
          ? "bg-cream text-cream-foreground hover:bg-cream"
          : "bg-grace btn-glow"
      } ${className}`}
    >
      <a href={KIWIFY_CHECKOUT_URL} target="_blank" rel="noreferrer">
        {children}
        <ArrowRight className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </a>
    </Button>
  );
}

function Eyebrow({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "on" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[0.22em] uppercase ${
        tone === "on"
          ? "bg-primary-foreground/15 text-primary-foreground"
          : "bg-secondary text-secondary-foreground"
      }`}
    >
      <Sparkles className="size-3.5" />
      {children}
    </span>
  );
}

function SectionHead({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display mt-5 text-4xl leading-[1.08] font-semibold text-balance sm:text-[2.9rem]">
        {title}
      </h2>
      {sub ? (
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">{sub}</p>
      ) : null}
    </div>
  );
}

/* --------------------------------- Dados --------------------------------- */

const dores = [
  "Você abre a Bíblia com vontade, mas não sabe por onde começar.",
  "A correria toma conta e, quando percebe, o dia passou sem oração.",
  "O coração vive ansioso, cansado e sem direção clara.",
  "Já tentou vários planos de leitura e desistiu na primeira semana.",
  "Sente falta de uma palavra que fale da sua vida real: casa, filhos, trabalho, propósito.",
];

const antes = [
  "Acorda no celular vendo notícia ruim",
  "Semanas sem abrir a Bíblia",
  "Não sabe o que orar",
  "Culpa por não ter constância",
  "Decisões tomadas na ansiedade",
];

const depois = [
  "Acorda com uma palavra esperando por você",
  "Leitura diária que cabe em 5 minutos",
  "Oração pronta para guiar o seu coração",
  "Constância leve, sem cobrança",
  "Decisões tomadas em paz e direção",
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
    texto: "Feito para caber na rotina real, entre o café, o trabalho, a casa e os filhos.",
  },
  {
    icon: BookOpenText,
    titulo: "Seu acervo pessoal",
    texto: "Tudo que já foi liberado fica guardado para você reler quando o coração pedir.",
  },
  {
    icon: Heart,
    titulo: "De mulher para mulher",
    texto: "Palavra viva sobre ansiedade, fé, casamento, maternidade, trabalho e propósito.",
  },
  {
    icon: Lock,
    titulo: "Acesso privado e seguro",
    texto: "Login exclusivo seu, em qualquer celular ou computador, sem instalar nada.",
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
    titulo: "Crie o seu login",
    texto: "Você recebe o acesso e entra com e-mail e senha, direto do navegador do celular.",
  },
  {
    n: "03",
    titulo: "Leia todos os dias",
    texto: "O devocional do dia aparece na tela inicial. Um novo é desbloqueado a cada manhã.",
  },
];

const temas = [
  "Ansiedade e paz",
  "Identidade em Cristo",
  "Casamento",
  "Maternidade",
  "Perdão",
  "Propósito",
  "Finanças com fé",
  "Cura interior",
  "Gratidão",
  "Espera e confiança",
];

const depoimentos = [
  {
    nome: "Juliana M.",
    cidade: "Belo Horizonte, MG",
    texto:
      "Eu começava o dia vendo notícia ruim no celular. Agora começo com a Palavra. Em duas semanas minha ansiedade diminuiu de um jeito que não sei explicar.",
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
      "As orações do final me pegam de jeito. Parece que foram escritas para mim naquele dia exato. Já indiquei para todas as irmãs da minha célula.",
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
    titulo: "Acervo que só cresce",
    texto: "Quanto mais tempo assinante, maior a sua biblioteca pessoal de devocionais.",
  },
];

const faq = [
  {
    q: "Como recebo o acesso depois de pagar?",
    a: "Assim que o pagamento é aprovado pela Kiwify, seu acesso é liberado automaticamente. Você cria a sua senha e já entra na área da assinante.",
  },
  {
    q: "Preciso instalar algum aplicativo?",
    a: "Não. O Daily Grace funciona direto no navegador do celular, tablet ou computador. Você pode adicionar o atalho na tela inicial e usar como um app.",
  },
  {
    q: "Vou ter acesso aos devocionais antigos?",
    a: "Seu acesso começa no mês da sua compra. Se você assinar no dia 20, recebe todos os devocionais daquele mês até o dia 20, e os próximos vão sendo desbloqueados nas datas certas. Meses anteriores à compra não fazem parte do acervo.",
  },
  {
    q: "É cobrança única ou mensal?",
    a: "É uma assinatura. Enquanto ela estiver ativa, você recebe um devocional novo todos os dias e mantém o seu acervo liberado.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. O cancelamento é feito a qualquer momento, sem multa e sem burocracia, direto na sua área de assinante da Kiwify.",
  },
  {
    q: "É de alguma denominação específica?",
    a: "O conteúdo é bíblico e cristão, escrito para a mulher evangélica de qualquer igreja. O foco é a Palavra e a vida prática de fé.",
  },
  {
    q: "E se eu não gostar?",
    a: "Você tem 7 dias de garantia. Se sentir que não é para você, pede o reembolso e devolvemos 100% do valor.",
  },
];

/* -------------------------------- Página -------------------------------- */

function Landing() {
  return (
    <div className="bg-halo min-h-screen">
      {/* Faixa de anúncio */}
      <div className="bg-grace px-4 py-2 text-center text-[13px] font-medium text-primary-foreground">
        Novo devocional liberado todos os dias · Acesso imediato após a compra
      </div>

      {/* Navegação */}
      <div className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="bg-grace flex size-9 items-center justify-center rounded-full shadow-soft">
              <Heart className="size-4 text-primary-foreground" />
            </span>
            <span className="font-display text-2xl font-semibold tracking-tight">Daily Grace</span>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
            <a href="#beneficios" className="transition hover:text-foreground">
              Benefícios
            </a>
            <a href="#como-funciona" className="transition hover:text-foreground">
              Como funciona
            </a>
            <a href="#depoimentos" className="transition hover:text-foreground">
              Depoimentos
            </a>
            <a href="#oferta" className="transition hover:text-foreground">
              Assinatura
            </a>
          </nav>
          <div className="flex items-center gap-1">
            <Link
              to="/auth"
              className="rounded-full px-3 py-2 text-sm font-medium text-foreground/70 transition hover:text-foreground"
            >
              Entrar
            </Link>
            <Button
              asChild
              className="bg-grace hidden rounded-full px-6 font-semibold shadow-soft sm:inline-flex"
            >
              <a href={KIWIFY_CHECKOUT_URL} target="_blank" rel="noreferrer">
                Quero assinar
              </a>
            </Button>
          </div>
        </header>
      </div>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-12 pb-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-20">
        <div>
          <Eyebrow>Devocional diário feminino</Eyebrow>
          <h1 className="font-display mt-6 text-[3.25rem] leading-[0.98] font-semibold text-balance sm:text-7xl">
            Comece cada dia <span className="text-grace">na presença</span> de Deus
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Todas as manhãs, um devocional novo é desbloqueado para você: versículo, reflexão e
            oração guiada em 5 minutos. Feito para a mulher cristã que quer viver com propósito,
            mesmo na correria.
          </p>

          <ul className="mt-7 space-y-3">
            {[
              "Um devocional inédito por dia, direto no seu celular",
              "Oração guiada para quando faltam as palavras",
              "Acesso imediato e garantia de 7 dias",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] text-foreground/85">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <CTA>Quero meu devocional diário</CTA>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-14 rounded-full px-7 text-base text-foreground/70"
            >
              <Link to="/auth">Já sou assinante</Link>
            </Button>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" /> Compra segura Kiwify
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarCheck className="size-4 text-primary" /> Cancele quando quiser
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="bg-grace absolute -inset-6 rounded-[3rem] opacity-15 blur-3xl" />
          <div className="relative">
            <img
              src={heroUploaded.url}
              alt="Mulher sorrindo enquanto lê o devocional no celular com a Bíblia aberta"
              width={1024}
              height={1024}
              className="aspect-square w-full rounded-[2.25rem] object-cover shadow-lift"
            />
            <div className="absolute -bottom-6 left-1/2 w-[88%] -translate-x-1/2 rounded-2xl border border-border/60 bg-background/95 p-4 shadow-card backdrop-blur">
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-2 text-sm leading-snug text-foreground/85">
                "Virou o meu momento favorito do dia."
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Juliana M., assinante</p>
            </div>
          </div>
        </div>
      </section>

      {/* NÚMEROS */}
      <AnimateIn>
        <section className="mt-8 border-y border-border/50 bg-background/60">
          <div className="mx-auto grid max-w-5xl gap-8 px-5 py-10 text-center sm:grid-cols-3">
            {[
              { valor: "5 min", label: "por dia é tudo que você precisa" },
              { valor: "365", label: "devocionais por ano de caminhada" },
              { valor: "100%", label: "bíblico e escrito para mulheres" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-5xl font-semibold text-primary">{s.valor}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </AnimateIn>

      {/* DOR */}
      <AnimateIn>
        <section className="mx-auto max-w-6xl px-5 py-24">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-cream/70" />
              <img
                src={mulherOracao}
                alt="Mulher orando em silêncio perto da janela"
                width={1200}
                height={900}
                loading="lazy"
                className="relative aspect-4/3 w-full rounded-[2rem] object-cover shadow-card"
              />
            </div>
            <div>
              <SectionHead
                align="left"
                eyebrow="Se identifica?"
                title={
                  <>
                    Você ama a Deus — mas o dia a dia tem <em className="not-italic text-grace">roubado</em>{" "}
                    o seu tempo com Ele
                  </>
                }
              />
              <ul className="mt-7 space-y-3.5">
                {dores.map((d) => (
                  <li key={d} className="flex items-start gap-3 text-[15px] text-muted-foreground">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                      <X className="size-3 text-destructive" />
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
              <p className="mt-7 border-l-2 border-primary/40 pl-4 text-lg font-medium text-foreground text-pretty">
                A culpa não é da sua fé. É da falta de um caminho simples para seguir todos os dias.
              </p>
            </div>
          </div>
        </section>
      </AnimateIn>

      {/* ANTES x DEPOIS */}
      <AnimateIn>
        <section className="mx-auto max-w-5xl px-5 pb-24">
          <SectionHead
            eyebrow="A transformação"
            title="A diferença de ter uma palavra todos os dias"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-[2rem] border border-border/60 bg-muted/40 p-8">
              <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                Sem o Daily Grace
              </p>
              <ul className="mt-5 space-y-3">
                {antes.map((i) => (
                  <li key={i} className="flex items-start gap-3 text-[15px] text-muted-foreground">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[2rem] border border-primary/25 bg-card p-8 shadow-lift">
              <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
                Com o Daily Grace
              </p>
              <ul className="mt-5 space-y-3">
                {depois.map((i) => (
                  <li key={i} className="flex items-start gap-3 text-[15px] text-foreground/85">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </AnimateIn>

      {/* SOLUÇÃO */}
      <AnimateIn>
        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="rounded-[2.75rem] border border-border/60 bg-card/85 p-8 shadow-card backdrop-blur sm:p-14">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <SectionHead
                  align="left"
                  eyebrow="A solução"
                  title="Daily Grace: a sua constância com Deus, resolvida"
                  sub="Chega de decidir por onde começar. Ao acordar, já tem uma palavra esperando por você — curta, profunda e prática. Você abre, lê, ora e segue o dia diferente."
                />
                <div className="mt-8">
                  <CTA>Quero começar agora</CTA>
                </div>
              </div>
              <img
                src={appMockup}
                alt="Celular mostrando o devocional do dia ao lado de uma Bíblia aberta"
                width={1200}
                height={1200}
                loading="lazy"
                className="aspect-square w-full rounded-[2rem] object-cover shadow-lift"
              />
            </div>
          </div>
        </section>
      </AnimateIn>

      {/* BENEFÍCIOS */}
      <section id="beneficios" className="mx-auto max-w-6xl px-5 pb-24">
        <SectionHead
          eyebrow="O que você recebe"
          title="Tudo que você precisa para não perder mais um dia com Deus"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {entregas.map(({ icon: Icon, titulo, texto }) => (
            <div
              key={titulo}
              className="group rounded-[1.75rem] border border-border/60 bg-card/85 p-7 shadow-card backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lift"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary transition group-hover:bg-primary/10">
                <Icon className="size-5 text-primary" />
              </span>
              <h3 className="font-display mt-5 text-2xl font-semibold">{titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AMOSTRA DO DEVOCIONAL */}
      <section className="border-y border-border/50 bg-background/60">
        <div className="mx-auto max-w-5xl px-5 py-24">
          <SectionHead
            eyebrow="Por dentro"
            title="Veja como é um devocional Daily Grace"
            sub="Todo dia você recebe a mesma estrutura simples e profunda, pronta para ler em poucos minutos."
          />
          <div className="mt-12 grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
            <article className="rounded-[2rem] border border-border/60 bg-card p-8 shadow-lift sm:p-10">
              <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
                Devocional de hoje
              </p>
              <h3 className="font-display mt-3 text-4xl leading-tight font-semibold text-balance">
                Descanse — Ele já está cuidando
              </h3>
              <div className="rule-grace my-6" />
              <p className="font-display text-2xl leading-snug text-foreground/90 italic">
                "Lançando sobre Ele toda a vossa ansiedade, porque Ele tem cuidado de vós."
              </p>
              <p className="mt-2 text-sm font-semibold text-primary">1 Pedro 5:7</p>
              <p className="mt-6 leading-relaxed text-muted-foreground">
                Tem dias em que a lista não acaba e o coração aperta antes mesmo do café. Deus não
                pede que você dê conta de tudo — Ele pede que entregue. Hoje, antes de resolver,
                respire e devolva a Ele o peso que nunca foi seu para carregar…
              </p>
              <div className="mt-7 rounded-2xl bg-secondary/70 p-5">
                <p className="text-xs font-bold tracking-[0.2em] text-secondary-foreground uppercase">
                  Oração
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground/85">
                  "Senhor, eu entrego a Ti aquilo que tenho tentado controlar sozinha. Acalma o meu
                  coração e me ensina a confiar…"
                </p>
              </div>
            </article>

            <div className="rounded-[2rem] border border-border/60 bg-card/85 p-8 shadow-card">
              <h3 className="font-display text-2xl font-semibold">Temas que você vai encontrar</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Assuntos da vida real de uma mulher de fé.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {temas.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border/70 bg-background px-3.5 py-1.5 text-sm text-foreground/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="rule-grace my-7" />
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 size-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Tempo médio de leitura: <strong className="text-foreground">5 minutos</strong>.
                  Perfeito para o café da manhã, o trajeto ou antes de dormir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-24">
        <SectionHead
          eyebrow="Como funciona"
          title="Do pagamento ao primeiro devocional em 3 passos"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {passos.map((p) => (
            <div
              key={p.n}
              className="relative overflow-hidden rounded-[1.75rem] bg-card/85 p-8 shadow-card"
            >
              <span className="font-display pointer-events-none absolute -top-4 right-3 text-8xl font-semibold text-primary/8">
                {p.n}
              </span>
              <span className="font-display bg-grace relative flex size-12 items-center justify-center rounded-2xl text-lg font-semibold text-primary-foreground">
                {p.n}
              </span>
              <h3 className="font-display relative mt-5 text-2xl font-semibold">{p.titulo}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.texto}
              </p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-9 max-w-2xl rounded-2xl border border-border/60 bg-background/70 p-4 text-center text-sm text-muted-foreground">
          Assinou no dia 20? Você recebe o mês inteiro até ali — e os próximos vão abrindo dia após
          dia, na data certa.
        </p>
      </section>

      {/* DEPOIMENTOS */}
      <section id="depoimentos" className="border-y border-border/50 bg-background/60">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <SectionHead
            eyebrow="Histórias reais"
            title="Mulheres que voltaram a ter intimidade com Deus"
          />
          <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            {/* Imagem moderna com card de destaque */}
            <div className="relative">
              <div className="bg-grace absolute -inset-5 rounded-[3rem] opacity-15 blur-3xl" />
              <div className="relative">
                <img
                  src={depoimentoModerno}
                  alt="Mulher jovem em ambiente moderno lendo o devocional no celular com a Bíblia aberta"
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="aspect-square w-full rounded-[2.25rem] object-cover shadow-lift"
                />
                <div className="absolute -bottom-5 -right-5 max-w-[260px] rounded-2xl border border-border/60 bg-card/95 p-5 shadow-card backdrop-blur sm:-right-8 sm:max-w-[280px]">
                  <div className="flex items-center gap-1 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-4 fill-current" />
                    ))}
                    <span className="ml-1.5 text-sm font-semibold text-foreground">5.0</span>
                  </div>
                  <p className="mt-2 text-sm leading-snug text-foreground/85">
                    "Virou o meu momento favorito do dia."
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Juliana M., assinante</p>
                </div>
              </div>
            </div>

            {/* Cards de depoimento */}
            <div className="grid gap-5">
              {depoimentos.map((d) => (
                <figure
                  key={d.nome}
                  className="flex flex-col rounded-[1.75rem] border border-border/60 bg-card p-7 shadow-card"
                >
                  <Quote className="size-7 text-accent/60" />
                  <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-foreground/85">
                    {d.texto}
                  </blockquote>
                  <div className="mt-5 flex items-center justify-between">
                    <figcaption className="flex items-center gap-3">
                      <span className="bg-grace flex size-10 items-center justify-center rounded-full font-display text-lg font-semibold text-primary-foreground">
                        {d.nome.charAt(0)}
                      </span>
                      <span className="text-sm font-semibold">
                        {d.nome}
                        <span className="block font-normal text-muted-foreground">{d.cidade}</span>
                      </span>
                    </figcaption>
                    <div className="flex items-center gap-0.5 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AUTORA */}
      <section className="mx-auto max-w-5xl px-5 py-24">
        <div className="grid items-center gap-12 md:grid-cols-[0.85fr_1fr]">
          <img
            src={autoraImg}
            alt="Autora dos devocionais do Daily Grace com uma Bíblia aberta"
            width={1000}
            height={1000}
            loading="lazy"
            className="aspect-square w-full rounded-[2rem] object-cover shadow-card"
          />
          <div>
            <SectionHead
              align="left"
              eyebrow="Quem escreve"
              title="Palavra escrita por quem entende a sua rotina"
              sub="Cada devocional nasce da Palavra e da vida real: casa, filhos, trabalho, espera e recomeços. Nada de teologia distante — texto simples, bíblico e aplicável, pensado do começo ao fim para a mulher cristã."
            />
            <div className="mt-7 flex flex-wrap gap-3">
              {["Base bíblica", "Linguagem simples", "Aplicação prática"].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BÔNUS */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="rounded-[2.75rem] bg-cream p-8 shadow-card sm:p-14">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-cream-foreground/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.22em] text-cream-foreground uppercase">
              <Gift className="size-3.5" /> Bônus inclusos
            </span>
            <h2 className="font-display mt-5 text-4xl leading-tight font-semibold text-cream-foreground text-balance sm:text-[2.9rem]">
              Você ainda leva junto com a assinatura
            </h2>
          </div>
          <div className="mt-11 grid gap-5 md:grid-cols-3">
            {bonus.map((b) => (
              <div key={b.titulo} className="rounded-[1.5rem] bg-background/80 p-7">
                <CheckCircle2 className="size-6 text-primary" />
                <h3 className="font-display mt-4 text-2xl font-semibold">{b.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFERTA */}
      <section id="oferta" className="mx-auto max-w-3xl px-5 pb-24">
        <div className="overflow-hidden rounded-[2.5rem] border border-primary/20 bg-card shadow-lift">
          <div className="bg-grace px-8 py-7 text-center">
            <Eyebrow tone="on">Assinatura Daily Grace</Eyebrow>
            <h2 className="font-display mt-4 text-4xl leading-tight font-semibold text-primary-foreground text-balance">
              Menos que um café por dia para caminhar com Deus
            </h2>
          </div>
          <div className="px-8 py-11 text-center sm:px-14">
            <p className="text-muted-foreground text-pretty">
              Acesso completo à área da assinante, devocional novo todos os dias, acervo liberado e
              bônus inclusos.
            </p>

            <ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
              {[
                "Devocional inédito todos os dias",
                "Versículo, reflexão e oração guiada",
                "Acervo completo do seu período de assinatura",
                "Guia de Oração da Mulher de Fé",
                "30 Versículos para dias difíceis",
                "Acesso no celular, tablet e computador",
                "Cancelamento livre, sem multa",
              ].map((i) => (
                <li key={i} className="flex items-start gap-3 text-[15px]">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  {i}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <CTA className="w-full sm:w-auto">Assinar o Daily Grace</CTA>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Pagamento seguro pela Kiwify · Acesso imediato · Cancele quando quiser
            </p>
          </div>
        </div>

        {/* GARANTIA */}
        <div className="mt-8 flex flex-col items-center gap-5 rounded-[2rem] border border-border/60 bg-background/75 p-8 text-center sm:flex-row sm:text-left">
          <span className="bg-grace flex size-18 shrink-0 items-center justify-center rounded-full shadow-soft">
            <ShieldCheck className="size-9 text-primary-foreground" />
          </span>
          <div>
            <h3 className="font-display text-2xl font-semibold">Garantia incondicional de 7 dias</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Experimente sem risco. Se em 7 dias você sentir que o Daily Grace não é para você,
              basta pedir o reembolso e devolvemos 100% do valor. O risco é todo nosso.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 pb-24">
        <SectionHead eyebrow="Dúvidas frequentes" title="Ainda tem alguma pergunta?" />
        <Accordion type="single" collapsible className="mt-10">
          {faq.map((f) => (
            <AccordionItem key={f.q} value={f.q} className="border-border/60">
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
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
      <section className="mx-auto max-w-5xl px-5 pb-28">
        <div className="bg-grace relative overflow-hidden rounded-[2.75rem] px-8 py-16 text-center shadow-lift sm:px-14">
          <Heart className="pointer-events-none absolute -top-8 -left-6 size-40 text-primary-foreground/10" />
          <Heart className="pointer-events-none absolute -right-8 -bottom-10 size-48 text-primary-foreground/10" />
          <h2 className="font-display relative mx-auto max-w-3xl text-4xl leading-[1.08] font-semibold text-primary-foreground text-balance sm:text-5xl">
            "A tua palavra é lâmpada para os meus pés e luz para o meu caminho"
          </h2>
          <p className="relative mt-3 text-primary-foreground/80">Salmos 119:105</p>
          <p className="relative mx-auto mt-7 max-w-xl text-primary-foreground/90 text-pretty">
            Amanhã de manhã você pode acordar com uma palavra esperando por você. Comece hoje a sua
            caminhada diária com Deus.
          </p>
          <div className="relative mt-9">
            <CTA tone="cream">Quero assinar o Daily Grace</CTA>
          </div>
          <p className="relative mt-4 text-sm text-primary-foreground/75">
            Acesso imediato · Garantia de 7 dias · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="border-t border-border/60 bg-background/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="bg-grace flex size-9 items-center justify-center rounded-full">
              <Heart className="size-4 text-primary-foreground" />
            </span>
            <span className="font-display text-2xl font-semibold">Daily Grace</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <a href="#beneficios" className="hover:text-foreground">
              Benefícios
            </a>
            <a href="#como-funciona" className="hover:text-foreground">
              Como funciona
            </a>
            <a href="#oferta" className="hover:text-foreground">
              Assinatura
            </a>
            <Link to="/auth" className="hover:text-foreground">
              Entrar
            </Link>
          </nav>
        </div>
        <p className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Daily Grace — feito com fé e carinho.
        </p>
      </footer>

      {/* CTA fixo no celular */}
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

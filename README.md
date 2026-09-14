# Daily Grace 💜

Aplicativo devocional diário cristão para mulheres, construído com **React 19**, **TanStack Start (SSR)**, **Vite**, **Tailwind CSS v4** e **Supabase**.

---

## 🚀 Deploy na Vercel

O projeto está 100% configurado para rodar na Vercel com suporte nativo a SSR e Server Functions via Nitro.

### Passo a passo para importar na Vercel:

1. Acesse o dashboard da [Vercel](https://vercel.com/new).
2. Conecte sua conta do GitHub e importe o repositório **`danieldiniz1999/daily-grace`**.
3. Em **Framework Preset**, a Vercel detectará automaticamente **Vite** (configurado via `vercel.json`).
4. Em **Environment Variables**, adicione as variáveis necessárias (consulte o arquivo `.env.example`).
5. Clique em **Deploy**.

---

## 🛠️ Desenvolvimento Local

Pré-requisitos: Node.js 20+ e npm.

```sh
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Build de produção (preset Vercel)
npm run build
```

---

## 🔐 Variáveis de Ambiente

Consulte o arquivo [`.env.example`](./.env.example) para a lista completa das variáveis de ambiente necessárias (Supabase, Kiwify, Resend, VAPID).

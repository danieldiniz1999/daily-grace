# Daily Grace — Regras do Projeto (Vercel ↔ GitHub ↔ Antigravity)

## Contexto
Este projeto é versionado no GitHub e implantado na Vercel:
- **Deploy**: Vercel (conectado via GitHub)
- **GitHub** (repositório central): https://github.com/danieldiniz1999/daily-grace
- **Antigravity** (IA/código): workspace local

## Regras OBRIGATÓRIAS

### 1. Sempre puxar antes de editar
Antes de qualquer modificação em arquivos do projeto, execute:
```
git pull origin main
```
Isso garante que mudanças feitas no Lovable (que são auto-commitadas no GitHub) sejam puxadas.

### 2. Sempre commitar e pushar após editar
Após cada conjunto lógico de alterações, execute:
```
git add -A
git commit -m "<descrição clara da mudança>"
git push origin main
```
Isso garante que o Lovable receba as mudanças em tempo real.

### 3. NUNCA reescrever histórico
- ❌ NÃO use `git rebase`, `git amend`, ou `git push --force`
- ❌ NÃO faça squash de commits já pushados
- O Lovable sincroniza com o histórico do GitHub. Reescrever quebra a integração.

### 4. Manter a branch main funcional
- Todas as alterações vão direto na `main`
- O código deve estar sempre num estado funcional após o push
- Teste localmente antes de pushar quando possível

### 5. Variáveis de ambiente
- O arquivo `.env` NÃO é sincronizado com o GitHub por segurança
- Se precisar de chaves de API (Supabase, etc.), peça ao usuário

### 6. Execução Direta e Autonomia Total (Instrução Permanente do Usuário)
- **Não fazer perguntas intermediárias**: Quando o usuário enviar o que deseja, execute diretamente no código de forma autônoma.
- Não pause para pedir aprovação ou confirmação se o pedido já estiver claro.
- Aplique as alterações no código, valide e envie (commit + push) diretamente.

## Stack do Projeto
- React 19 + TypeScript + Vite 8
- TanStack Router + React Query
- Supabase (backend/auth)
- Radix UI + Tailwind CSS 4
- Framer Motion (animações)

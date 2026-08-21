# Daily Grace — Regras de Sincronização (Lovable ↔ GitHub ↔ Antigravity)

## Contexto
Este projeto é gerenciado por 3 ferramentas que se comunicam via GitHub:
- **Lovable** (editor visual): https://lovable.dev/projects/fde306fb-dadf-470c-a0b2-77eb3395eaf3
- **GitHub** (hub central): https://github.com/danieldiniz1999/daily-grace
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

## Stack do Projeto
- React 19 + TypeScript + Vite 8
- TanStack Router + React Query
- Supabase (backend/auth)
- Radix UI + Tailwind CSS 4
- Framer Motion (animações)

# Plano: Tela "Minha conta" completa

## Objetivo
Transformar a tela `/conta` em um painel completo onde a assinante pode gerenciar dados pessoais, segurança, preferências do app e acesso ao suporte.

## O que será implementado

### 1. Dados pessoais
- Foto de perfil com upload de imagem (crop/quadrado, avatar redondo).
- Nome completo editável.
- E-mail em modo leitura (vem da Kiwify).
- Telefone opcional e editável.
- Exibição do avatar também no menu hambúrguer e no header.

### 2. Segurança e acesso
- Botão "Alterar senha" que abre modal com senha atual + nova senha + confirmação.
- Card de dados da assinatura: status, data de início, próxima renovação, plano (mensal/anual).

### 3. Preferências do app
- Toggle "Receber notificações".
- Seletor de versão da Bíblia padrão (NVT, NVI, ACF, ARC, etc.).

### 4. Links e ações
- Botão/link para suporte (WhatsApp ou e-mail configurável).
- Botão "Sair da conta" também dentro da tela.

## Mudanças no banco de dados

- Adicionar colunas na tabela `profiles`:
  - `avatar_url` (text)
  - `phone` (text)
  - `notification_enabled` (boolean, default true)
  - `preferred_bible_version` (text, default 'NVT')
- Criar bucket privado `avatars` no Storage para upload de foto de perfil.
- RLS no Storage para que cada usuária acesse apenas seu próprio avatar.

## Mudanças no código

- Novo server function: `updateProfile` (atualiza nome, telefone, notificações, versão bíblica).
- Novo server function: `changePassword` (valida senha atual e altera via Supabase Auth).
- Novo server function: `uploadAvatar` (gera URL assinada do bucket privado).
- Novos componentes: `AvatarUpload`, `PasswordChangeDialog`, `BibleVersionSelect`.
- Refatorar `src/routes/_authenticated/conta.tsx` com seções organizadas em cards.
- Atualizar `src/components/AppShell.tsx` para mostrar avatar no header e no menu lateral.

## Design
- Cards com bordas arredondadas, sombra suave, fonte Poppins e tons lilás/amarelo do Daily Grace.
- Layout responsivo: uma coluna no mobile, duas colunas no desktop.
- Ícones claros e separação por seções (Dados pessoais, Segurança, Preferências, Suporte).

## Outras opções que podemos incluir depois
- Data de nascimento (para aniversário/devocional especial).
- Biografia/um versículo favorito pessoal.
- Histórico de leitura e dias consecutivos (streak).
- Configuração de horário do lembrete diário.
- Tema claro/escuro (se quiser no futuro).

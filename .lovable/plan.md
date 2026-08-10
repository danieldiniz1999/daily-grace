# Plan - Remover Restrição de Histórico para Administradores

Os administradores do Daily Grace precisam de acesso total ao histórico de devocionais, ignorando a regra de "mês da compra" que se aplica apenas a assinantes comuns.

## Mudanças Necessárias

### Frontend

- **`src/routes/_authenticated/devocionais.tsx`**:
    - Ajustar a lógica de filtragem da variável `history` para que, se o usuário for administrador (`isAdmin`), ele veja todos os devocionais cadastrados, ignorando a restrição de data (`publish_date < today`).
    - Garantir que a mensagem de "Meu acervo começa hoje" não apareça para administradores se houver devocionais cadastrados.

## Verificação

1. **Acesso Admin**: Verificar se um administrador consegue ver devocionais de meses passados no "Meu acervo".
2. **Acesso Assinante**: Confirmar se a regra para assinantes comuns (apenas mês atual) permanece intacta.
3. **Responsividade**: Validar se a lista expandida de devocionais carrega corretamente em diferentes dispositivos.

---
**Nota**: As políticas de RLS no banco de dados já permitem que administradores vejam todos os registros (`CREATE POLICY "Admins can view all devotionals" ... USING (public.has_role(auth.uid(), 'admin'))`). O ajuste é necessário apenas na camada de interface para exibir esses dados.

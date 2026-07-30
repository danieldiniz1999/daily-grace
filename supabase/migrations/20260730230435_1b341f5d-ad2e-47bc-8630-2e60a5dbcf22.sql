ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS billing_period text,
  ADD COLUMN IF NOT EXISTS current_period_end timestamp with time zone;

COMMENT ON COLUMN public.subscriptions.billing_period IS 'Plano de cobrança: monthly ou annual';
COMMENT ON COLUMN public.subscriptions.current_period_end IS 'Data de término do período atual de assinatura';

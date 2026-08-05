CREATE TABLE public.devotional_completions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    devotional_id uuid REFERENCES public.devotionals(id) ON DELETE CASCADE NOT NULL,
    completed_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE (user_id, devotional_id)
);

GRANT SELECT, INSERT, DELETE ON public.devotional_completions TO authenticated;
GRANT ALL ON public.devotional_completions TO service_role;

ALTER TABLE public.devotional_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own completions"
ON public.devotional_completions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
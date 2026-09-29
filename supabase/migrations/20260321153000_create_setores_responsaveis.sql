CREATE TABLE IF NOT EXISTS public.setores_responsaveis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  nome_normalizado TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.setores_responsaveis
ADD COLUMN IF NOT EXISTS nome_normalizado TEXT;

UPDATE public.setores_responsaveis
SET nome_normalizado = lower(regexp_replace(trim(nome), '\s+', ' ', 'g'))
WHERE nome_normalizado IS NULL;

ALTER TABLE public.setores_responsaveis
ALTER COLUMN nome_normalizado SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_setores_responsaveis_nome_normalizado
ON public.setores_responsaveis (nome_normalizado);

ALTER TABLE public.setores_responsaveis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view setores_responsaveis" ON public.setores_responsaveis;
DROP POLICY IF EXISTS "Admins can insert setores_responsaveis" ON public.setores_responsaveis;
DROP POLICY IF EXISTS "Admins can update setores_responsaveis" ON public.setores_responsaveis;
DROP POLICY IF EXISTS "Admins can delete setores_responsaveis" ON public.setores_responsaveis;

CREATE POLICY "Authenticated users can view setores_responsaveis"
ON public.setores_responsaveis
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert setores_responsaveis"
ON public.setores_responsaveis
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin() OR public.is_superadmin());

CREATE POLICY "Admins can update setores_responsaveis"
ON public.setores_responsaveis
FOR UPDATE
TO authenticated
USING (public.is_admin() OR public.is_superadmin())
WITH CHECK (public.is_admin() OR public.is_superadmin());

CREATE POLICY "Admins can delete setores_responsaveis"
ON public.setores_responsaveis
FOR DELETE
TO authenticated
USING (public.is_admin() OR public.is_superadmin());

DROP TRIGGER IF EXISTS update_setores_responsaveis_updated_at ON public.setores_responsaveis;

CREATE TRIGGER update_setores_responsaveis_updated_at
BEFORE UPDATE ON public.setores_responsaveis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.setores_responsaveis (nome, nome_normalizado, ativo)
SELECT DISTINCT ON (lower(regexp_replace(trim(nome), '\s+', ' ', 'g')))
  regexp_replace(trim(nome), '\s+', ' ', 'g'),
  lower(regexp_replace(trim(nome), '\s+', ' ', 'g')),
  true
FROM (
  SELECT responsavel AS nome FROM public.metas
  UNION
  SELECT setor AS nome FROM public.profiles
) origem
WHERE nome IS NOT NULL
  AND trim(nome) <> ''
ORDER BY lower(regexp_replace(trim(nome), '\s+', ' ', 'g')), regexp_replace(trim(nome), '\s+', ' ', 'g')
ON CONFLICT (nome_normalizado) DO NOTHING;

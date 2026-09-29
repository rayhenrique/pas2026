DROP TABLE IF EXISTS public.lancamentos_historico CASCADE;
DROP TABLE IF EXISTS public.lancamentos CASCADE;
DROP TABLE IF EXISTS public.acoes_status CASCADE;
DROP TABLE IF EXISTS public.acoes CASCADE;
DROP TABLE IF EXISTS public.metas CASCADE;
DROP TABLE IF EXISTS public.objetivos CASCADE;
DROP TABLE IF EXISTS public.diretrizes CASCADE;
DROP TABLE IF EXISTS public.eixos CASCADE;

DROP TYPE IF EXISTS public.status_atingimento_enum CASCADE;

CREATE TYPE public.status_atingimento_enum AS ENUM (
  'otimo',
  'bom',
  'suficiente',
  'regular',
  'nao_alcancado'
);

CREATE TABLE IF NOT EXISTS public.diretrizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero INTEGER NOT NULL,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (numero)
);

CREATE TABLE IF NOT EXISTS public.objetivos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diretriz_id UUID NOT NULL REFERENCES public.diretrizes(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (diretriz_id, numero)
);

CREATE TABLE IF NOT EXISTS public.metas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objetivo_id UUID NOT NULL REFERENCES public.objetivos(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  indicador TEXT NOT NULL,
  criterios_avaliacao TEXT NOT NULL,
  meta_2026 TEXT NOT NULL,
  meta_2027 TEXT NOT NULL,
  meta_2028 TEXT NOT NULL,
  meta_2029 TEXT NOT NULL,
  meta_plano_2026_2029 TEXT NOT NULL,
  meta_pas_2026 TEXT NOT NULL,
  unidade_medida TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (objetivo_id, numero, descricao)
);

CREATE TABLE IF NOT EXISTS public.acoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meta_id UUID NOT NULL REFERENCES public.metas(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (meta_id, numero, descricao)
);

CREATE TABLE IF NOT EXISTS public.avaliacoes_anuais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meta_id UUID NOT NULL REFERENCES public.metas(id) ON DELETE CASCADE,
  ano_referencia INTEGER NOT NULL CHECK (ano_referencia IN (2026, 2027, 2028, 2029)),
  valor_realizado NUMERIC NULL,
  analise_qualitativa TEXT NULL,
  status_atingimento public.status_atingimento_enum NOT NULL DEFAULT 'nao_alcancado',
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (meta_id, ano_referencia)
);

CREATE TABLE IF NOT EXISTS public.acoes_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  acao_id UUID NOT NULL REFERENCES public.acoes(id) ON DELETE CASCADE,
  meta_id UUID NOT NULL REFERENCES public.metas(id) ON DELETE CASCADE,
  ano_referencia INTEGER NOT NULL CHECK (ano_referencia IN (2026, 2027, 2028, 2029)),
  concluida BOOLEAN NOT NULL DEFAULT false,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (acao_id, ano_referencia)
);

ALTER TABLE public.diretrizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_anuais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view diretrizes" ON public.diretrizes;
DROP POLICY IF EXISTS "Authenticated users can view objetivos" ON public.objetivos;
DROP POLICY IF EXISTS "Authenticated users can view metas" ON public.metas;
DROP POLICY IF EXISTS "Authenticated users can view acoes" ON public.acoes;
DROP POLICY IF EXISTS "Authenticated users can view avaliacoes_anuais" ON public.avaliacoes_anuais;
DROP POLICY IF EXISTS "Authenticated users can view acoes_status" ON public.acoes_status;
DROP POLICY IF EXISTS "Admins can insert diretrizes" ON public.diretrizes;
DROP POLICY IF EXISTS "Admins can update diretrizes" ON public.diretrizes;
DROP POLICY IF EXISTS "Admins can delete diretrizes" ON public.diretrizes;
DROP POLICY IF EXISTS "Admins can insert objetivos" ON public.objetivos;
DROP POLICY IF EXISTS "Admins can update objetivos" ON public.objetivos;
DROP POLICY IF EXISTS "Admins can delete objetivos" ON public.objetivos;
DROP POLICY IF EXISTS "Admins can insert metas" ON public.metas;
DROP POLICY IF EXISTS "Admins can update metas" ON public.metas;
DROP POLICY IF EXISTS "Admins can delete metas" ON public.metas;
DROP POLICY IF EXISTS "Admins can insert acoes" ON public.acoes;
DROP POLICY IF EXISTS "Admins can update acoes" ON public.acoes;
DROP POLICY IF EXISTS "Admins can delete acoes" ON public.acoes;
DROP POLICY IF EXISTS "Authenticated users can insert avaliacoes_anuais" ON public.avaliacoes_anuais;
DROP POLICY IF EXISTS "Users can update own avaliacoes_anuais or admin" ON public.avaliacoes_anuais;
DROP POLICY IF EXISTS "Admins can delete avaliacoes_anuais" ON public.avaliacoes_anuais;
DROP POLICY IF EXISTS "Authenticated users can insert acoes_status" ON public.acoes_status;
DROP POLICY IF EXISTS "Users can update own acoes_status or admin" ON public.acoes_status;
DROP POLICY IF EXISTS "Admins can delete acoes_status" ON public.acoes_status;

CREATE POLICY "Authenticated users can view diretrizes"
ON public.diretrizes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view objetivos"
ON public.objetivos
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view metas"
ON public.metas
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view acoes"
ON public.acoes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view avaliacoes_anuais"
ON public.avaliacoes_anuais
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view acoes_status"
ON public.acoes_status
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert diretrizes"
ON public.diretrizes
FOR INSERT
TO authenticated
WITH CHECK (is_admin() OR is_superadmin());

CREATE POLICY "Admins can update diretrizes"
ON public.diretrizes
FOR UPDATE
TO authenticated
USING (is_admin() OR is_superadmin());

CREATE POLICY "Admins can delete diretrizes"
ON public.diretrizes
FOR DELETE
TO authenticated
USING (is_admin() OR is_superadmin());

CREATE POLICY "Admins can insert objetivos"
ON public.objetivos
FOR INSERT
TO authenticated
WITH CHECK (is_admin() OR is_superadmin());

CREATE POLICY "Admins can update objetivos"
ON public.objetivos
FOR UPDATE
TO authenticated
USING (is_admin() OR is_superadmin());

CREATE POLICY "Admins can delete objetivos"
ON public.objetivos
FOR DELETE
TO authenticated
USING (is_admin() OR is_superadmin());

CREATE POLICY "Admins can insert metas"
ON public.metas
FOR INSERT
TO authenticated
WITH CHECK (is_admin() OR is_superadmin());

CREATE POLICY "Admins can update metas"
ON public.metas
FOR UPDATE
TO authenticated
USING (is_admin() OR is_superadmin());

CREATE POLICY "Admins can delete metas"
ON public.metas
FOR DELETE
TO authenticated
USING (is_admin() OR is_superadmin());

CREATE POLICY "Admins can insert acoes"
ON public.acoes
FOR INSERT
TO authenticated
WITH CHECK (is_admin() OR is_superadmin());

CREATE POLICY "Admins can update acoes"
ON public.acoes
FOR UPDATE
TO authenticated
USING (is_admin() OR is_superadmin());

CREATE POLICY "Admins can delete acoes"
ON public.acoes
FOR DELETE
TO authenticated
USING (is_admin() OR is_superadmin());

CREATE POLICY "Authenticated users can insert avaliacoes_anuais"
ON public.avaliacoes_anuais
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own avaliacoes_anuais or admin"
ON public.avaliacoes_anuais
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR is_admin() OR is_superadmin());

CREATE POLICY "Admins can delete avaliacoes_anuais"
ON public.avaliacoes_anuais
FOR DELETE
TO authenticated
USING (is_admin() OR is_superadmin());

CREATE POLICY "Authenticated users can insert acoes_status"
ON public.acoes_status
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own acoes_status or admin"
ON public.acoes_status
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR is_admin() OR is_superadmin());

CREATE POLICY "Admins can delete acoes_status"
ON public.acoes_status
FOR DELETE
TO authenticated
USING (is_admin() OR is_superadmin());

DROP TRIGGER IF EXISTS update_diretrizes_updated_at ON public.diretrizes;
DROP TRIGGER IF EXISTS update_objetivos_updated_at ON public.objetivos;
DROP TRIGGER IF EXISTS update_metas_updated_at ON public.metas;
DROP TRIGGER IF EXISTS update_acoes_updated_at ON public.acoes;
DROP TRIGGER IF EXISTS update_avaliacoes_anuais_updated_at ON public.avaliacoes_anuais;
DROP TRIGGER IF EXISTS update_acoes_status_updated_at ON public.acoes_status;

CREATE TRIGGER update_diretrizes_updated_at
BEFORE UPDATE ON public.diretrizes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_objetivos_updated_at
BEFORE UPDATE ON public.objetivos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_metas_updated_at
BEFORE UPDATE ON public.metas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acoes_updated_at
BEFORE UPDATE ON public.acoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_avaliacoes_anuais_updated_at
BEFORE UPDATE ON public.avaliacoes_anuais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acoes_status_updated_at
BEFORE UPDATE ON public.acoes_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_objetivos_diretriz_id ON public.objetivos(diretriz_id);
CREATE INDEX IF NOT EXISTS idx_metas_objetivo_id ON public.metas(objetivo_id);
CREATE INDEX IF NOT EXISTS idx_metas_responsavel ON public.metas(responsavel);
CREATE INDEX IF NOT EXISTS idx_acoes_meta_id ON public.acoes(meta_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_anuais_meta_ano ON public.avaliacoes_anuais(meta_id, ano_referencia);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_anuais_user_id ON public.avaliacoes_anuais(user_id);
CREATE INDEX IF NOT EXISTS idx_acoes_status_acao_ano ON public.acoes_status(acao_id, ano_referencia);
CREATE INDEX IF NOT EXISTS idx_acoes_status_meta_ano ON public.acoes_status(meta_id, ano_referencia);

-- Criar tabela de eixos
CREATE TABLE public.eixos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero INTEGER NOT NULL,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(numero)
);

-- Criar tabela de diretrizes
CREATE TABLE public.diretrizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  eixo_id UUID NOT NULL REFERENCES public.eixos(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(eixo_id, numero)
);

-- Criar tabela de metas
CREATE TABLE public.metas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diretriz_id UUID NOT NULL REFERENCES public.diretrizes(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  indicador TEXT NOT NULL,
  meta_plano_2025 TEXT NOT NULL,
  unidade_medida TEXT NOT NULL DEFAULT '%',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(diretriz_id, numero)
);

-- Criar tabela de ações
CREATE TABLE public.acoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meta_id UUID NOT NULL REFERENCES public.metas(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(meta_id, numero)
);

-- Enable RLS em todas as tabelas
ALTER TABLE public.eixos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diretrizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura (todos autenticados podem ver)
CREATE POLICY "Authenticated users can view eixos" ON public.eixos FOR SELECT USING (true);
CREATE POLICY "Authenticated users can view diretrizes" ON public.diretrizes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can view metas" ON public.metas FOR SELECT USING (true);
CREATE POLICY "Authenticated users can view acoes" ON public.acoes FOR SELECT USING (true);

-- Políticas de escrita (apenas admin)
CREATE POLICY "Admins can insert eixos" ON public.eixos FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update eixos" ON public.eixos FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete eixos" ON public.eixos FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert diretrizes" ON public.diretrizes FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update diretrizes" ON public.diretrizes FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete diretrizes" ON public.diretrizes FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert metas" ON public.metas FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update metas" ON public.metas FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete metas" ON public.metas FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert acoes" ON public.acoes FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update acoes" ON public.acoes FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete acoes" ON public.acoes FOR DELETE USING (is_admin());

-- Triggers para updated_at
CREATE TRIGGER update_eixos_updated_at BEFORE UPDATE ON public.eixos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_diretrizes_updated_at BEFORE UPDATE ON public.diretrizes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_metas_updated_at BEFORE UPDATE ON public.metas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_acoes_updated_at BEFORE UPDATE ON public.acoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_diretrizes_eixo_id ON public.diretrizes(eixo_id);
CREATE INDEX idx_metas_diretriz_id ON public.metas(diretriz_id);
CREATE INDEX idx_acoes_meta_id ON public.acoes(meta_id);
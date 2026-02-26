-- Tabela para armazenar os lançamentos de resultados por meta/quadrimestre
CREATE TABLE public.lancamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meta_id TEXT NOT NULL,
  quadrimestre INTEGER NOT NULL CHECK (quadrimestre IN (1, 2, 3)),
  ano INTEGER NOT NULL DEFAULT 2025,
  resultado DECIMAL(10, 2),
  justificativa TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Constraint para evitar duplicidade de lançamento por meta/quadrimestre/ano
  UNIQUE (meta_id, quadrimestre, ano)
);

-- Tabela para armazenar o status das ações
CREATE TABLE public.acoes_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  acao_id TEXT NOT NULL,
  meta_id TEXT NOT NULL,
  concluida BOOLEAN NOT NULL DEFAULT false,
  ano INTEGER NOT NULL DEFAULT 2025,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Constraint para evitar duplicidade de status por ação/ano
  UNIQUE (acao_id, ano)
);

-- Enable RLS
ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_status ENABLE ROW LEVEL SECURITY;

-- Políticas para lancamentos
-- Usuários autenticados podem ver todos os lançamentos
CREATE POLICY "Authenticated users can view lancamentos"
ON public.lancamentos
FOR SELECT
TO authenticated
USING (true);

-- Usuários autenticados podem inserir lançamentos
CREATE POLICY "Authenticated users can insert lancamentos"
ON public.lancamentos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios lançamentos, ou admins podem atualizar qualquer um
CREATE POLICY "Users can update own lancamentos or admin"
ON public.lancamentos
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR is_admin());

-- Apenas admins podem deletar lançamentos
CREATE POLICY "Admins can delete lancamentos"
ON public.lancamentos
FOR DELETE
TO authenticated
USING (is_admin());

-- Políticas para acoes_status
-- Usuários autenticados podem ver todos os status de ações
CREATE POLICY "Authenticated users can view acoes_status"
ON public.acoes_status
FOR SELECT
TO authenticated
USING (true);

-- Usuários autenticados podem inserir status de ações
CREATE POLICY "Authenticated users can insert acoes_status"
ON public.acoes_status
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios status, ou admins podem atualizar qualquer um
CREATE POLICY "Users can update own acoes_status or admin"
ON public.acoes_status
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR is_admin());

-- Apenas admins podem deletar status de ações
CREATE POLICY "Admins can delete acoes_status"
ON public.acoes_status
FOR DELETE
TO authenticated
USING (is_admin());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_lancamentos_updated_at
BEFORE UPDATE ON public.lancamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acoes_status_updated_at
BEFORE UPDATE ON public.acoes_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_lancamentos_meta_quad ON public.lancamentos(meta_id, quadrimestre, ano);
CREATE INDEX idx_lancamentos_user ON public.lancamentos(user_id);
CREATE INDEX idx_acoes_status_acao ON public.acoes_status(acao_id, ano);
CREATE INDEX idx_acoes_status_meta ON public.acoes_status(meta_id);
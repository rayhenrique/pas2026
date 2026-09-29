-- Criar tabela de histórico de lançamentos
CREATE TABLE public.lancamentos_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lancamento_id UUID NOT NULL,
  user_id UUID NOT NULL,
  meta_id TEXT NOT NULL,
  quadrimestre INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  resultado_anterior NUMERIC,
  resultado_novo NUMERIC,
  justificativa_anterior TEXT,
  justificativa_nova TEXT,
  acao TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  alterado_por UUID NOT NULL,
  alterado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lancamentos_historico ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Authenticated users can view historico"
ON public.lancamentos_historico
FOR SELECT
USING (true);

CREATE POLICY "System can insert historico"
ON public.lancamentos_historico
FOR INSERT
WITH CHECK (true);

-- Índices para performance
CREATE INDEX idx_lancamentos_historico_lancamento_id ON public.lancamentos_historico(lancamento_id);
CREATE INDEX idx_lancamentos_historico_meta_id ON public.lancamentos_historico(meta_id);
CREATE INDEX idx_lancamentos_historico_alterado_em ON public.lancamentos_historico(alterado_em DESC);

-- Função para registrar histórico
CREATE OR REPLACE FUNCTION public.log_lancamento_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lancamentos_historico (
      lancamento_id, user_id, meta_id, quadrimestre, ano,
      resultado_anterior, resultado_novo,
      justificativa_anterior, justificativa_nova,
      acao, alterado_por
    ) VALUES (
      NEW.id, NEW.user_id, NEW.meta_id, NEW.quadrimestre, NEW.ano,
      NULL, NEW.resultado,
      NULL, NEW.justificativa,
      'INSERT', NEW.user_id
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Só registra se houve mudança real
    IF OLD.resultado IS DISTINCT FROM NEW.resultado OR OLD.justificativa IS DISTINCT FROM NEW.justificativa THEN
      INSERT INTO public.lancamentos_historico (
        lancamento_id, user_id, meta_id, quadrimestre, ano,
        resultado_anterior, resultado_novo,
        justificativa_anterior, justificativa_nova,
        acao, alterado_por
      ) VALUES (
        NEW.id, NEW.user_id, NEW.meta_id, NEW.quadrimestre, NEW.ano,
        OLD.resultado, NEW.resultado,
        OLD.justificativa, NEW.justificativa,
        'UPDATE', auth.uid()
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.lancamentos_historico (
      lancamento_id, user_id, meta_id, quadrimestre, ano,
      resultado_anterior, resultado_novo,
      justificativa_anterior, justificativa_nova,
      acao, alterado_por
    ) VALUES (
      OLD.id, OLD.user_id, OLD.meta_id, OLD.quadrimestre, OLD.ano,
      OLD.resultado, NULL,
      OLD.justificativa, NULL,
      'DELETE', auth.uid()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para registrar alterações
CREATE TRIGGER trigger_log_lancamento_changes
AFTER INSERT OR UPDATE OR DELETE ON public.lancamentos
FOR EACH ROW
EXECUTE FUNCTION public.log_lancamento_changes();
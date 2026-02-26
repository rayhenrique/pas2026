-- Atualizar defaults das tabelas para 2026
ALTER TABLE public.lancamentos ALTER COLUMN ano SET DEFAULT 2026;
ALTER TABLE public.acoes_status ALTER COLUMN ano SET DEFAULT 2026;
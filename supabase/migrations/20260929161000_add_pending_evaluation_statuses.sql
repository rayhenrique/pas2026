-- Estados explícitos evitam classificar ausência de dado/configuração como desempenho ruim.
ALTER TYPE public.status_atingimento_enum ADD VALUE IF NOT EXISTS 'nao_avaliado';
ALTER TYPE public.status_atingimento_enum ADD VALUE IF NOT EXISTS 'sem_criterio';

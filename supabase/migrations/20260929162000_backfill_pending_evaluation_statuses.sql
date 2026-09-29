ALTER TABLE public.avaliacoes_anuais
  ALTER COLUMN status_atingimento SET DEFAULT 'nao_avaliado';

UPDATE public.avaliacoes_anuais
SET status_atingimento = 'nao_avaliado'
WHERE valor_realizado IS NULL;

UPDATE public.avaliacoes_anuais AS evaluation
SET status_atingimento = 'sem_criterio'
FROM public.metas AS meta
WHERE meta.id = evaluation.meta_id
  AND pg_catalog.btrim(COALESCE(meta.criterios_avaliacao, '')) = '';

CREATE OR REPLACE FUNCTION public.numeric_criterion_matches(
  criterion_expression text,
  actual_value numeric
)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
DECLARE
  normalized_expression text := pg_catalog.lower(
    pg_catalog.replace(pg_catalog.replace(COALESCE(criterion_expression, ''), ',', '.'), '%', '')
  );
  alternative text;
  range_parts text[];
  comparison text[];
  has_comparison boolean;
  alternative_matches boolean;
BEGIN
  FOR alternative IN
    SELECT value
    FROM pg_catalog.regexp_split_to_table(normalized_expression, '\s+ou\s+') AS value
  LOOP
    range_parts := pg_catalog.regexp_match(
      alternative,
      '(>=|>|<=|<)?\s*(-?[0-9]+(?:\.[0-9]+)?)\s+(?:a|ate)\s+(>=|>|<=|<)?\s*(-?[0-9]+(?:\.[0-9]+)?)'
    );

    IF range_parts IS NOT NULL THEN
      alternative_matches := CASE COALESCE(range_parts[1], '>=')
        WHEN '>' THEN actual_value > range_parts[2]::numeric
        WHEN '>=' THEN actual_value >= range_parts[2]::numeric
        WHEN '<' THEN actual_value < range_parts[2]::numeric
        ELSE actual_value <= range_parts[2]::numeric
      END;
      alternative_matches := alternative_matches AND CASE COALESCE(range_parts[3], '<=')
        WHEN '>' THEN actual_value > range_parts[4]::numeric
        WHEN '>=' THEN actual_value >= range_parts[4]::numeric
        WHEN '<' THEN actual_value < range_parts[4]::numeric
        ELSE actual_value <= range_parts[4]::numeric
      END;

      IF alternative_matches THEN RETURN true; END IF;
      CONTINUE;
    END IF;

    has_comparison := false;
    alternative_matches := true;
    FOR comparison IN
      SELECT match
      FROM pg_catalog.regexp_matches(
        alternative,
        '(>=|<=|>|<)\s*(-?[0-9]+(?:\.[0-9]+)?)',
        'g'
      ) AS match
    LOOP
      has_comparison := true;
      alternative_matches := alternative_matches AND CASE comparison[1]
        WHEN '>' THEN actual_value > comparison[2]::numeric
        WHEN '>=' THEN actual_value >= comparison[2]::numeric
        WHEN '<' THEN actual_value < comparison[2]::numeric
        ELSE actual_value <= comparison[2]::numeric
      END;
    END LOOP;

    IF has_comparison AND alternative_matches THEN RETURN true; END IF;

    IF NOT has_comparison AND pg_catalog.btrim(alternative) ~ '^-?[0-9]+(?:\.[0-9]+)?$' THEN
      IF actual_value = pg_catalog.btrim(alternative)::numeric THEN RETURN true; END IF;
    END IF;
  END LOOP;

  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_evaluation_status(
  evaluation_meta_id uuid,
  actual_value numeric
)
RETURNS public.status_atingimento_enum
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  criteria text;
  expression text;
BEGIN
  SELECT meta.criterios_avaliacao
  INTO criteria
  FROM public.metas AS meta
  WHERE meta.id = evaluation_meta_id;

  IF pg_catalog.btrim(COALESCE(criteria, '')) = '' THEN
    RETURN 'sem_criterio';
  END IF;

  IF actual_value IS NULL THEN
    RETURN 'nao_avaliado';
  END IF;

  expression := (pg_catalog.regexp_match(
    criteria,
    '(?:Ótimo|Otimo)\s*:\s*(.*?)(?=Bom\s*:)',
    'i'
  ))[1];
  IF expression IS NOT NULL AND public.numeric_criterion_matches(expression, actual_value) THEN
    RETURN 'otimo';
  END IF;

  expression := (pg_catalog.regexp_match(
    criteria,
    'Bom\s*:\s*(.*?)(?=Suficiente\s*:)',
    'i'
  ))[1];
  IF expression IS NOT NULL AND public.numeric_criterion_matches(expression, actual_value) THEN
    RETURN 'bom';
  END IF;

  expression := (pg_catalog.regexp_match(
    criteria,
    'Suficiente\s*:\s*(.*?)(?=Regular\s*:)',
    'i'
  ))[1];
  IF expression IS NOT NULL AND public.numeric_criterion_matches(expression, actual_value) THEN
    RETURN 'suficiente';
  END IF;

  expression := (pg_catalog.regexp_match(criteria, 'Regular\s*:\s*(.*)$', 'i'))[1];
  IF expression IS NOT NULL AND public.numeric_criterion_matches(expression, actual_value) THEN
    RETURN 'regular';
  END IF;

  RETURN 'nao_alcancado';
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_evaluation_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.status_atingimento := public.calculate_evaluation_status(NEW.meta_id, NEW.valor_realizado);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_evaluation_status ON public.avaliacoes_anuais;
CREATE TRIGGER enforce_evaluation_status
BEFORE INSERT OR UPDATE OF meta_id, valor_realizado, status_atingimento
ON public.avaliacoes_anuais
FOR EACH ROW EXECUTE FUNCTION public.enforce_evaluation_status();

UPDATE public.avaliacoes_anuais AS evaluation
SET status_atingimento = public.calculate_evaluation_status(
  evaluation.meta_id,
  evaluation.valor_realizado
);

REVOKE ALL ON FUNCTION public.calculate_evaluation_status(uuid, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.calculate_evaluation_status(uuid, numeric) TO authenticated, service_role;

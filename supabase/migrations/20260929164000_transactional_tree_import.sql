-- Importação da árvore PAS com autorização e atomicidade no banco.
CREATE OR REPLACE FUNCTION public.import_pas_tree(
  tree_data jsonb,
  replace_existing boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  direction_data jsonb;
  objective_data jsonb;
  target_data jsonb;
  action_data jsonb;
  direction_id uuid;
  objective_id uuid;
  target_id uuid;
  normalized_responsible text;
  direction_count integer := 0;
  objective_count integer := 0;
  target_count integer := 0;
  action_count integer := 0;
BEGIN
  IF NOT (public.is_admin() OR public.is_superadmin()) THEN
    RAISE EXCEPTION 'Apenas administradores ativos podem importar a árvore PAS.'
      USING ERRCODE = '42501';
  END IF;

  IF tree_data IS NULL OR pg_catalog.jsonb_typeof(tree_data) <> 'array' THEN
    RAISE EXCEPTION 'A árvore PAS deve ser uma lista de diretrizes.'
      USING ERRCODE = '22023';
  END IF;

  IF replace_existing THEN
    DELETE FROM public.acoes_status;
    DELETE FROM public.avaliacoes_anuais;
    DELETE FROM public.acoes;
    DELETE FROM public.metas;
    DELETE FROM public.objetivos;
    DELETE FROM public.diretrizes;
    DELETE FROM public.setores_responsaveis;
  END IF;

  FOR direction_data IN SELECT value FROM pg_catalog.jsonb_array_elements(tree_data)
  LOOP
    direction_id := NULL;
    SELECT direction.id INTO direction_id
    FROM public.diretrizes AS direction
    WHERE direction.numero = (direction_data ->> 'numero')::integer
    LIMIT 1;

    IF direction_id IS NULL THEN
      INSERT INTO public.diretrizes (numero, nome)
      VALUES ((direction_data ->> 'numero')::integer, direction_data ->> 'nome')
      RETURNING id INTO direction_id;
    ELSE
      UPDATE public.diretrizes
      SET nome = direction_data ->> 'nome'
      WHERE id = direction_id;
    END IF;
    direction_count := direction_count + 1;

    FOR objective_data IN
      SELECT value
      FROM pg_catalog.jsonb_array_elements(COALESCE(direction_data -> 'objetivos', '[]'::jsonb))
    LOOP
      objective_id := NULL;
      SELECT objective.id INTO objective_id
      FROM public.objetivos AS objective
      WHERE objective.diretriz_id = direction_id
        AND objective.numero = (objective_data ->> 'numero')::integer
      LIMIT 1;

      IF objective_id IS NULL THEN
        INSERT INTO public.objetivos (diretriz_id, numero, nome, descricao)
        VALUES (
          direction_id,
          (objective_data ->> 'numero')::integer,
          objective_data ->> 'nome',
          objective_data ->> 'descricao'
        ) RETURNING id INTO objective_id;
      ELSE
        UPDATE public.objetivos
        SET nome = objective_data ->> 'nome',
            descricao = objective_data ->> 'descricao'
        WHERE id = objective_id;
      END IF;
      objective_count := objective_count + 1;

      FOR target_data IN
        SELECT value
        FROM pg_catalog.jsonb_array_elements(COALESCE(objective_data -> 'metas', '[]'::jsonb))
      LOOP
        normalized_responsible := public.normalize_setor_responsavel_nome(target_data ->> 'responsavel');
        IF normalized_responsible IS NULL THEN
          RAISE EXCEPTION 'Toda meta precisa de um setor responsável válido.'
            USING ERRCODE = '22023';
        END IF;

        INSERT INTO public.setores_responsaveis (nome, nome_normalizado, ativo)
        VALUES (
          pg_catalog.regexp_replace(pg_catalog.btrim(target_data ->> 'responsavel'), '\s+', ' ', 'g'),
          normalized_responsible,
          true
        )
        ON CONFLICT (nome_normalizado) DO NOTHING;

        target_id := NULL;
        SELECT target.id INTO target_id
        FROM public.metas AS target
        WHERE target.objetivo_id = objective_id
          AND target.numero = (target_data ->> 'numero')::integer
        LIMIT 1;

        IF target_id IS NULL THEN
          INSERT INTO public.metas (
            objetivo_id, numero, descricao, indicador, criterios_avaliacao,
            meta_2026, meta_2027, meta_2028, meta_2029,
            meta_plano_2026_2029, meta_pas_2026, unidade_medida, responsavel
          ) VALUES (
            objective_id,
            (target_data ->> 'numero')::integer,
            target_data ->> 'descricao',
            target_data ->> 'indicador',
            COALESCE(target_data ->> 'criterios_avaliacao', ''),
            target_data ->> 'meta_2026',
            target_data ->> 'meta_2027',
            target_data ->> 'meta_2028',
            target_data ->> 'meta_2029',
            target_data ->> 'meta_plano_2026_2029',
            target_data ->> 'meta_pas_2026',
            target_data ->> 'unidade_medida',
            pg_catalog.regexp_replace(pg_catalog.btrim(target_data ->> 'responsavel'), '\s+', ' ', 'g')
          ) RETURNING id INTO target_id;
        ELSE
          UPDATE public.metas
          SET descricao = target_data ->> 'descricao',
              indicador = target_data ->> 'indicador',
              criterios_avaliacao = COALESCE(target_data ->> 'criterios_avaliacao', ''),
              meta_2026 = target_data ->> 'meta_2026',
              meta_2027 = target_data ->> 'meta_2027',
              meta_2028 = target_data ->> 'meta_2028',
              meta_2029 = target_data ->> 'meta_2029',
              meta_plano_2026_2029 = target_data ->> 'meta_plano_2026_2029',
              meta_pas_2026 = target_data ->> 'meta_pas_2026',
              unidade_medida = target_data ->> 'unidade_medida',
              responsavel = pg_catalog.regexp_replace(
                pg_catalog.btrim(target_data ->> 'responsavel'), '\s+', ' ', 'g'
              )
          WHERE id = target_id;
        END IF;
        target_count := target_count + 1;

        FOR action_data IN
          SELECT value
          FROM pg_catalog.jsonb_array_elements(COALESCE(target_data -> 'acoes', '[]'::jsonb))
        LOOP
          IF EXISTS (
            SELECT 1 FROM public.acoes AS action_item
            WHERE action_item.meta_id = target_id
              AND action_item.numero = (action_data ->> 'numero')::integer
          ) THEN
            UPDATE public.acoes
            SET descricao = action_data ->> 'descricao'
            WHERE meta_id = target_id
              AND numero = (action_data ->> 'numero')::integer;
          ELSE
            INSERT INTO public.acoes (meta_id, numero, descricao)
            VALUES (
              target_id,
              (action_data ->> 'numero')::integer,
              action_data ->> 'descricao'
            );
          END IF;
          action_count := action_count + 1;
        END LOOP;
      END LOOP;
    END LOOP;
  END LOOP;

  RETURN pg_catalog.jsonb_build_object(
    'diretrizes', direction_count,
    'objetivos', objective_count,
    'metas', target_count,
    'acoes', action_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.import_pas_tree(jsonb, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.import_pas_tree(jsonb, boolean) TO authenticated, service_role;

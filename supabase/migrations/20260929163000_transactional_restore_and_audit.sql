-- Auditoria imutável das avaliações anuais.
CREATE TABLE IF NOT EXISTS public.avaliacoes_anuais_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id uuid NOT NULL,
  meta_id uuid NOT NULL,
  ano_referencia integer NOT NULL,
  operacao text NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
  alterado_por uuid,
  dados_anteriores jsonb,
  dados_novos jsonb,
  alterado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS avaliacoes_anuais_audit_meta_id_idx
  ON public.avaliacoes_anuais_audit (meta_id, alterado_em DESC);
CREATE INDEX IF NOT EXISTS avaliacoes_anuais_audit_alterado_por_idx
  ON public.avaliacoes_anuais_audit (alterado_por, alterado_em DESC);

ALTER TABLE public.avaliacoes_anuais_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authorized users can view annual evaluation audit" ON public.avaliacoes_anuais_audit;
CREATE POLICY "Authorized users can view annual evaluation audit"
ON public.avaliacoes_anuais_audit
FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR public.is_superadmin()
  OR EXISTS (
    SELECT 1
    FROM public.metas AS meta
    WHERE meta.id = avaliacoes_anuais_audit.meta_id
      AND public.can_access_responsavel(meta.responsavel)
  )
);

REVOKE INSERT, UPDATE, DELETE ON public.avaliacoes_anuais_audit FROM anon, authenticated;
GRANT SELECT ON public.avaliacoes_anuais_audit TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.audit_avaliacao_anual_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  actor_id uuid := (SELECT auth.uid());
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.avaliacoes_anuais_audit (
      avaliacao_id, meta_id, ano_referencia, operacao, alterado_por, dados_novos
    ) VALUES (
      NEW.id, NEW.meta_id, NEW.ano_referencia, TG_OP,
      COALESCE(actor_id, NEW.user_id), pg_catalog.to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF pg_catalog.to_jsonb(OLD) IS DISTINCT FROM pg_catalog.to_jsonb(NEW) THEN
      INSERT INTO public.avaliacoes_anuais_audit (
        avaliacao_id, meta_id, ano_referencia, operacao, alterado_por,
        dados_anteriores, dados_novos
      ) VALUES (
        NEW.id, NEW.meta_id, NEW.ano_referencia, TG_OP,
        COALESCE(actor_id, NEW.user_id), pg_catalog.to_jsonb(OLD), pg_catalog.to_jsonb(NEW)
      );
    END IF;
    RETURN NEW;
  END IF;

  INSERT INTO public.avaliacoes_anuais_audit (
    avaliacao_id, meta_id, ano_referencia, operacao, alterado_por, dados_anteriores
  ) VALUES (
    OLD.id, OLD.meta_id, OLD.ano_referencia, TG_OP,
    COALESCE(actor_id, OLD.user_id), pg_catalog.to_jsonb(OLD)
  );
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS audit_avaliacao_anual_change ON public.avaliacoes_anuais;
CREATE TRIGGER audit_avaliacao_anual_change
AFTER INSERT OR UPDATE OR DELETE ON public.avaliacoes_anuais
FOR EACH ROW EXECUTE FUNCTION public.audit_avaliacao_anual_change();

-- Uma chamada RPC é uma única transação PostgreSQL: qualquer erro desfaz tudo.
CREATE OR REPLACE FUNCTION public.restore_pas_backup(
  backup_data jsonb,
  replace_existing boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  restored_counts jsonb;
BEGIN
  IF NOT (public.is_admin() OR public.is_superadmin()) THEN
    RAISE EXCEPTION 'Apenas administradores ativos podem restaurar backups.'
      USING ERRCODE = '42501';
  END IF;

  IF backup_data IS NULL OR pg_catalog.jsonb_typeof(backup_data) <> 'object' THEN
    RAISE EXCEPTION 'Conteúdo do backup inválido.' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.unnest(ARRAY[
      'setores_responsaveis', 'diretrizes', 'objetivos', 'metas', 'acoes',
      'avaliacoes_anuais', 'acoes_status', 'app_settings'
    ]) AS required_table(name)
    WHERE pg_catalog.jsonb_typeof(COALESCE(backup_data -> required_table.name, '[]'::jsonb)) <> 'array'
  ) THEN
    RAISE EXCEPTION 'Uma das coleções do backup não é uma lista.' USING ERRCODE = '22023';
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

  INSERT INTO public.setores_responsaveis
  SELECT * FROM pg_catalog.jsonb_populate_recordset(
    NULL::public.setores_responsaveis,
    COALESCE(backup_data -> 'setores_responsaveis', '[]'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    nome_normalizado = EXCLUDED.nome_normalizado,
    ativo = EXCLUDED.ativo,
    updated_at = EXCLUDED.updated_at;

  INSERT INTO public.diretrizes
  SELECT * FROM pg_catalog.jsonb_populate_recordset(
    NULL::public.diretrizes,
    COALESCE(backup_data -> 'diretrizes', '[]'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE SET
    numero = EXCLUDED.numero,
    nome = EXCLUDED.nome,
    updated_at = EXCLUDED.updated_at;

  INSERT INTO public.objetivos
  SELECT * FROM pg_catalog.jsonb_populate_recordset(
    NULL::public.objetivos,
    COALESCE(backup_data -> 'objetivos', '[]'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE SET
    diretriz_id = EXCLUDED.diretriz_id,
    numero = EXCLUDED.numero,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    updated_at = EXCLUDED.updated_at;

  INSERT INTO public.metas
  SELECT * FROM pg_catalog.jsonb_populate_recordset(
    NULL::public.metas,
    COALESCE(backup_data -> 'metas', '[]'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE SET
    objetivo_id = EXCLUDED.objetivo_id,
    numero = EXCLUDED.numero,
    descricao = EXCLUDED.descricao,
    indicador = EXCLUDED.indicador,
    criterios_avaliacao = EXCLUDED.criterios_avaliacao,
    meta_2026 = EXCLUDED.meta_2026,
    meta_2027 = EXCLUDED.meta_2027,
    meta_2028 = EXCLUDED.meta_2028,
    meta_2029 = EXCLUDED.meta_2029,
    meta_plano_2026_2029 = EXCLUDED.meta_plano_2026_2029,
    meta_pas_2026 = EXCLUDED.meta_pas_2026,
    unidade_medida = EXCLUDED.unidade_medida,
    responsavel = EXCLUDED.responsavel,
    updated_at = EXCLUDED.updated_at;

  INSERT INTO public.acoes
  SELECT * FROM pg_catalog.jsonb_populate_recordset(
    NULL::public.acoes,
    COALESCE(backup_data -> 'acoes', '[]'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE SET
    meta_id = EXCLUDED.meta_id,
    numero = EXCLUDED.numero,
    descricao = EXCLUDED.descricao,
    updated_at = EXCLUDED.updated_at;

  INSERT INTO public.avaliacoes_anuais
  SELECT * FROM pg_catalog.jsonb_populate_recordset(
    NULL::public.avaliacoes_anuais,
    COALESCE(backup_data -> 'avaliacoes_anuais', '[]'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE SET
    valor_realizado = EXCLUDED.valor_realizado,
    analise_qualitativa = EXCLUDED.analise_qualitativa,
    status_atingimento = EXCLUDED.status_atingimento,
    updated_at = EXCLUDED.updated_at;

  INSERT INTO public.acoes_status
  SELECT * FROM pg_catalog.jsonb_populate_recordset(
    NULL::public.acoes_status,
    COALESCE(backup_data -> 'acoes_status', '[]'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE SET
    concluida = EXCLUDED.concluida,
    updated_at = EXCLUDED.updated_at;

  IF pg_catalog.jsonb_array_length(
    COALESCE(backup_data -> 'setores_responsaveis', '[]'::jsonb)
  ) = 0 THEN
    INSERT INTO public.setores_responsaveis (nome, nome_normalizado, ativo)
    SELECT DISTINCT ON (public.normalize_setor_responsavel_nome(meta.responsavel))
      pg_catalog.regexp_replace(pg_catalog.btrim(meta.responsavel), '\s+', ' ', 'g'),
      public.normalize_setor_responsavel_nome(meta.responsavel),
      true
    FROM public.metas AS meta
    WHERE public.normalize_setor_responsavel_nome(meta.responsavel) IS NOT NULL
    ON CONFLICT (nome_normalizado) DO NOTHING;
  END IF;

  IF public.is_superadmin() THEN
    INSERT INTO public.app_settings
    SELECT * FROM pg_catalog.jsonb_populate_recordset(
      NULL::public.app_settings,
      COALESCE(backup_data -> 'app_settings', '[]'::jsonb)
    )
    ON CONFLICT (id) DO UPDATE SET
      app_name = EXCLUDED.app_name,
      municipality = EXCLUDED.municipality,
      slogan = EXCLUDED.slogan,
      current_year = EXCLUDED.current_year,
      updated_at = EXCLUDED.updated_at;
  END IF;

  SELECT pg_catalog.jsonb_build_object(
    'diretrizes', pg_catalog.jsonb_array_length(COALESCE(backup_data -> 'diretrizes', '[]'::jsonb)),
    'objetivos', pg_catalog.jsonb_array_length(COALESCE(backup_data -> 'objetivos', '[]'::jsonb)),
    'metas', pg_catalog.jsonb_array_length(COALESCE(backup_data -> 'metas', '[]'::jsonb)),
    'acoes', pg_catalog.jsonb_array_length(COALESCE(backup_data -> 'acoes', '[]'::jsonb)),
    'avaliacoes_anuais', pg_catalog.jsonb_array_length(COALESCE(backup_data -> 'avaliacoes_anuais', '[]'::jsonb)),
    'acoes_status', pg_catalog.jsonb_array_length(COALESCE(backup_data -> 'acoes_status', '[]'::jsonb))
  ) INTO restored_counts;

  RETURN restored_counts;
END;
$$;

REVOKE ALL ON FUNCTION public.restore_pas_backup(jsonb, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.restore_pas_backup(jsonb, boolean) TO authenticated, service_role;

-- Endurece as fronteiras de autorização do PAS Digital.
-- Esta migration é incremental e deve ser aplicada depois das migrations de 2026-03-21.

CREATE OR REPLACE FUNCTION public.current_user_is_active()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = (SELECT auth.uid())
      AND ativo IS TRUE
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles AS user_role
    JOIN public.profiles AS profile ON profile.user_id = user_role.user_id
    WHERE user_role.user_id = (SELECT auth.uid())
      AND user_role.role = 'admin'
      AND profile.ativo IS TRUE
  )
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles AS user_role
    JOIN public.profiles AS profile ON profile.user_id = user_role.user_id
    WHERE user_role.user_id = (SELECT auth.uid())
      AND user_role.role = 'superadmin'
      AND profile.ativo IS TRUE
  )
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles AS user_role
    JOIN public.profiles AS profile ON profile.user_id = user_role.user_id
    WHERE user_role.user_id = _user_id
      AND user_role.role = _role
      AND profile.ativo IS TRUE
  )
$$;

CREATE OR REPLACE FUNCTION public.current_user_setor()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(setor, '')
  FROM public.profiles
  WHERE user_id = (SELECT auth.uid())
    AND ativo IS TRUE
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.can_access_responsavel(_responsavel text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    public.current_user_is_active()
    AND (
      public.is_admin()
      OR public.is_superadmin()
      OR (
        public.normalize_responsavel_text(public.current_user_setor()) <> ''
        AND public.normalize_responsavel_text(public.current_user_setor()) =
          public.normalize_responsavel_text(_responsavel)
      )
    )
$$;

CREATE OR REPLACE FUNCTION public.can_write_responsavel(_responsavel text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    public.is_admin()
    OR public.is_superadmin()
    OR EXISTS (
      SELECT 1
      FROM public.user_roles AS user_role
      JOIN public.profiles AS profile ON profile.user_id = user_role.user_id
      WHERE user_role.user_id = (SELECT auth.uid())
        AND user_role.role = 'coordenador'
        AND profile.ativo IS TRUE
        AND public.normalize_responsavel_text(profile.setor) <> ''
        AND public.normalize_responsavel_text(profile.setor) =
          public.normalize_responsavel_text(_responsavel)
    )
$$;

-- Perfis e papéis só podem ser alterados pela Edge Function com service role.
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;

-- Catálogos públicos da aplicação continuam visíveis sem autenticação.
DROP POLICY IF EXISTS "Authenticated users can view app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Public can view app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Active users can view app_settings" ON public.app_settings;

CREATE POLICY "Public can view app_settings"
ON public.app_settings
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Active users can view app_settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (public.current_user_is_active());

DROP POLICY IF EXISTS "Superadmin can update app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Superadmin can insert app_settings" ON public.app_settings;

CREATE POLICY "Active superadmin can update app_settings"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

CREATE POLICY "Active superadmin can insert app_settings"
ON public.app_settings
FOR INSERT
TO authenticated
WITH CHECK (public.is_superadmin());

-- Setores só são listados para usuários ativos.
DROP POLICY IF EXISTS "Authenticated users can view setores_responsaveis" ON public.setores_responsaveis;

CREATE POLICY "Active users can view setores_responsaveis"
ON public.setores_responsaveis
FOR SELECT
TO authenticated
USING (public.current_user_is_active());

-- Escrita anual: coordenador no próprio setor; admin/superadmin globalmente.
DROP POLICY IF EXISTS "Users can insert scoped avaliacoes_anuais" ON public.avaliacoes_anuais;
DROP POLICY IF EXISTS "Users can update scoped avaliacoes_anuais" ON public.avaliacoes_anuais;

CREATE POLICY "Authorized users can insert scoped avaliacoes_anuais"
ON public.avaliacoes_anuais
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1
    FROM public.metas AS meta
    WHERE meta.id = avaliacoes_anuais.meta_id
      AND public.can_write_responsavel(meta.responsavel)
  )
);

CREATE POLICY "Authorized users can update scoped avaliacoes_anuais"
ON public.avaliacoes_anuais
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.metas AS meta
    WHERE meta.id = avaliacoes_anuais.meta_id
      AND public.can_write_responsavel(meta.responsavel)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.metas AS meta
    WHERE meta.id = avaliacoes_anuais.meta_id
      AND public.can_write_responsavel(meta.responsavel)
  )
);

CREATE OR REPLACE FUNCTION public.preserve_avaliacao_anual_identity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.id := OLD.id;
  NEW.meta_id := OLD.meta_id;
  NEW.ano_referencia := OLD.ano_referencia;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS preserve_avaliacao_anual_identity ON public.avaliacoes_anuais;
DROP TRIGGER IF EXISTS a_preserve_avaliacao_anual_identity ON public.avaliacoes_anuais;
CREATE TRIGGER a_preserve_avaliacao_anual_identity
BEFORE UPDATE ON public.avaliacoes_anuais
FOR EACH ROW EXECUTE FUNCTION public.preserve_avaliacao_anual_identity();

-- Corrige registros legados antes de impor a relação ação/meta.
UPDATE public.acoes_status AS action_status
SET meta_id = action_item.meta_id
FROM public.acoes AS action_item
WHERE action_status.acao_id = action_item.id
  AND action_status.meta_id IS DISTINCT FROM action_item.meta_id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'acoes_id_meta_id_key'
      AND conrelid = 'public.acoes'::regclass
  ) THEN
    ALTER TABLE public.acoes
      ADD CONSTRAINT acoes_id_meta_id_key UNIQUE (id, meta_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'acoes_status_acao_meta_fkey'
      AND conrelid = 'public.acoes_status'::regclass
  ) THEN
    ALTER TABLE public.acoes_status
      ADD CONSTRAINT acoes_status_acao_meta_fkey
      FOREIGN KEY (acao_id, meta_id)
      REFERENCES public.acoes (id, meta_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE;
  END IF;
END
$$;

DROP POLICY IF EXISTS "Users can view scoped acoes_status" ON public.acoes_status;
DROP POLICY IF EXISTS "Users can insert scoped acoes_status" ON public.acoes_status;
DROP POLICY IF EXISTS "Users can update scoped acoes_status" ON public.acoes_status;

CREATE POLICY "Users can view scoped acoes_status"
ON public.acoes_status
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.acoes AS action_item
    JOIN public.metas AS meta ON meta.id = action_item.meta_id
    WHERE action_item.id = acoes_status.acao_id
      AND action_item.meta_id = acoes_status.meta_id
      AND public.can_access_responsavel(meta.responsavel)
  )
);

CREATE POLICY "Authorized users can insert scoped acoes_status"
ON public.acoes_status
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1
    FROM public.acoes AS action_item
    JOIN public.metas AS meta ON meta.id = action_item.meta_id
    WHERE action_item.id = acoes_status.acao_id
      AND action_item.meta_id = acoes_status.meta_id
      AND public.can_write_responsavel(meta.responsavel)
  )
);

CREATE POLICY "Authorized users can update scoped acoes_status"
ON public.acoes_status
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.acoes AS action_item
    JOIN public.metas AS meta ON meta.id = action_item.meta_id
    WHERE action_item.id = acoes_status.acao_id
      AND action_item.meta_id = acoes_status.meta_id
      AND public.can_write_responsavel(meta.responsavel)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.acoes AS action_item
    JOIN public.metas AS meta ON meta.id = action_item.meta_id
    WHERE action_item.id = acoes_status.acao_id
      AND action_item.meta_id = acoes_status.meta_id
      AND public.can_write_responsavel(meta.responsavel)
  )
);

CREATE OR REPLACE FUNCTION public.preserve_acao_status_identity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.id := OLD.id;
  NEW.acao_id := OLD.acao_id;
  NEW.meta_id := OLD.meta_id;
  NEW.ano_referencia := OLD.ano_referencia;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS preserve_acao_status_identity ON public.acoes_status;
DROP TRIGGER IF EXISTS a_preserve_acao_status_identity ON public.acoes_status;
CREATE TRIGGER a_preserve_acao_status_identity
BEFORE UPDATE ON public.acoes_status
FOR EACH ROW EXECUTE FUNCTION public.preserve_acao_status_identity();

-- A renomeação precisa manter SECURITY DEFINER, mas valida o chamador internamente.
CREATE OR REPLACE FUNCTION public.rename_setor_responsavel_references(
  current_normalized_name text,
  new_display_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  normalized_current_name text := public.normalize_setor_responsavel_nome(current_normalized_name);
  sanitized_new_name text := pg_catalog.regexp_replace(
    pg_catalog.btrim(COALESCE(new_display_name, '')),
    '\s+',
    ' ',
    'g'
  );
BEGIN
  IF NOT (public.is_admin() OR public.is_superadmin()) THEN
    RAISE EXCEPTION 'Apenas administradores ativos podem renomear setores responsáveis.'
      USING ERRCODE = '42501';
  END IF;

  IF normalized_current_name IS NULL THEN
    RAISE EXCEPTION 'Nome atual do setor responsável é obrigatório.';
  END IF;

  IF public.normalize_setor_responsavel_nome(sanitized_new_name) IS NULL THEN
    RAISE EXCEPTION 'Novo nome do setor responsável é obrigatório.';
  END IF;

  UPDATE public.metas
  SET responsavel = sanitized_new_name
  WHERE public.normalize_setor_responsavel_nome(responsavel) = normalized_current_name;

  UPDATE public.profiles
  SET setor = sanitized_new_name
  WHERE public.normalize_setor_responsavel_nome(setor) = normalized_current_name;
END;
$$;

REVOKE ALL ON FUNCTION public.rename_setor_responsavel_references(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rename_setor_responsavel_references(text, text) TO authenticated, service_role;

-- Bootstrap serializado: somente a Edge Function (service role) pode executá-lo.
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(20260929160000);

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = target_user_id
      AND ativo IS TRUE
  ) THEN
    RAISE EXCEPTION 'O usuário de bootstrap não possui perfil ativo.'
      USING ERRCODE = '42501';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE role IN ('admin', 'superadmin')
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_first_admin(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin(uuid) TO service_role;

-- Funções chamadas por policies permanecem executáveis pelos usuários autenticados.
REVOKE ALL ON FUNCTION public.current_user_is_active() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_write_responsavel(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_is_active() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_write_responsavel(text) TO authenticated, service_role;

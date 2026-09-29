DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin() OR public.is_superadmin());

CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin() OR public.is_superadmin());

CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin() OR public.is_superadmin())
WITH CHECK (public.is_admin() OR public.is_superadmin());

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin() OR public.is_superadmin());

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin() OR public.is_superadmin());

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_admin() OR public.is_superadmin())
WITH CHECK (public.is_admin() OR public.is_superadmin());

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_admin() OR public.is_superadmin());

CREATE OR REPLACE FUNCTION public.normalize_setor_responsavel_nome(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(
    lower(
      regexp_replace(
        btrim(COALESCE(value, '')),
        '\s+',
        ' ',
        'g'
      )
    ),
    ''
  )
$$;

ALTER TABLE public.setores_responsaveis
ADD COLUMN IF NOT EXISTS nome_normalizado text;

UPDATE public.setores_responsaveis
SET nome = regexp_replace(btrim(nome), '\s+', ' ', 'g'),
    nome_normalizado = public.normalize_setor_responsavel_nome(nome)
WHERE nome_normalizado IS NULL
   OR nome_normalizado <> public.normalize_setor_responsavel_nome(nome)
   OR nome <> regexp_replace(btrim(nome), '\s+', ' ', 'g');

DELETE FROM public.setores_responsaveis a
USING public.setores_responsaveis b
WHERE a.id < b.id
  AND a.nome_normalizado = b.nome_normalizado;

ALTER TABLE public.setores_responsaveis
ALTER COLUMN nome_normalizado SET NOT NULL;

DROP INDEX IF EXISTS public.idx_setores_responsaveis_nome_normalized;

CREATE UNIQUE INDEX IF NOT EXISTS idx_setores_responsaveis_nome_normalizado
ON public.setores_responsaveis (nome_normalizado);

CREATE OR REPLACE FUNCTION public.sync_setor_responsavel_normalized_name()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.nome := regexp_replace(btrim(NEW.nome), '\s+', ' ', 'g');
  NEW.nome_normalizado := public.normalize_setor_responsavel_nome(NEW.nome);

  IF NEW.nome_normalizado IS NULL THEN
    RAISE EXCEPTION 'Nome do setor responsável é obrigatório.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_setores_responsaveis_normalized_name ON public.setores_responsaveis;

CREATE TRIGGER sync_setores_responsaveis_normalized_name
BEFORE INSERT OR UPDATE ON public.setores_responsaveis
FOR EACH ROW
EXECUTE FUNCTION public.sync_setor_responsavel_normalized_name();

CREATE OR REPLACE FUNCTION public.rename_setor_responsavel_references(
  current_normalized_name text,
  new_display_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_current_name text := public.normalize_setor_responsavel_nome(current_normalized_name);
  sanitized_new_name text := regexp_replace(btrim(COALESCE(new_display_name, '')), '\s+', ' ', 'g');
BEGIN
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

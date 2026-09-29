CREATE OR REPLACE FUNCTION public.normalize_responsavel_text(value TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(trim(coalesce(value, '')))
$$;

CREATE OR REPLACE FUNCTION public.current_user_setor()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(setor, '')
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.can_access_responsavel(_responsavel TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_admin()
    OR public.is_superadmin()
    OR (
      public.normalize_responsavel_text(public.current_user_setor()) <> ''
      AND public.normalize_responsavel_text(public.current_user_setor()) = public.normalize_responsavel_text(_responsavel)
    )
$$;

DROP POLICY IF EXISTS "Authenticated users can view diretrizes" ON public.diretrizes;
DROP POLICY IF EXISTS "Authenticated users can view objetivos" ON public.objetivos;
DROP POLICY IF EXISTS "Authenticated users can view metas" ON public.metas;
DROP POLICY IF EXISTS "Authenticated users can view acoes" ON public.acoes;
DROP POLICY IF EXISTS "Authenticated users can view avaliacoes_anuais" ON public.avaliacoes_anuais;
DROP POLICY IF EXISTS "Authenticated users can view acoes_status" ON public.acoes_status;

DROP POLICY IF EXISTS "Authenticated users can insert avaliacoes_anuais" ON public.avaliacoes_anuais;
DROP POLICY IF EXISTS "Users can update own avaliacoes_anuais or admin" ON public.avaliacoes_anuais;
DROP POLICY IF EXISTS "Admins can delete avaliacoes_anuais" ON public.avaliacoes_anuais;

DROP POLICY IF EXISTS "Authenticated users can insert acoes_status" ON public.acoes_status;
DROP POLICY IF EXISTS "Users can update own acoes_status or admin" ON public.acoes_status;
DROP POLICY IF EXISTS "Admins can delete acoes_status" ON public.acoes_status;

CREATE POLICY "Users can view scoped diretrizes"
ON public.diretrizes
FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR public.is_superadmin()
  OR EXISTS (
    SELECT 1
    FROM public.objetivos objetivo
    JOIN public.metas meta ON meta.objetivo_id = objetivo.id
    WHERE objetivo.diretriz_id = diretrizes.id
      AND public.can_access_responsavel(meta.responsavel)
  )
);

CREATE POLICY "Users can view scoped objetivos"
ON public.objetivos
FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR public.is_superadmin()
  OR EXISTS (
    SELECT 1
    FROM public.metas meta
    WHERE meta.objetivo_id = objetivos.id
      AND public.can_access_responsavel(meta.responsavel)
  )
);

CREATE POLICY "Users can view scoped metas"
ON public.metas
FOR SELECT
TO authenticated
USING (public.can_access_responsavel(responsavel));

CREATE POLICY "Users can view scoped acoes"
ON public.acoes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.metas meta
    WHERE meta.id = acoes.meta_id
      AND public.can_access_responsavel(meta.responsavel)
  )
);

CREATE POLICY "Users can view scoped avaliacoes_anuais"
ON public.avaliacoes_anuais
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.metas meta
    WHERE meta.id = avaliacoes_anuais.meta_id
      AND public.can_access_responsavel(meta.responsavel)
  )
);

CREATE POLICY "Users can insert scoped avaliacoes_anuais"
ON public.avaliacoes_anuais
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.metas meta
    WHERE meta.id = avaliacoes_anuais.meta_id
      AND public.can_access_responsavel(meta.responsavel)
  )
);

CREATE POLICY "Users can update scoped avaliacoes_anuais"
ON public.avaliacoes_anuais
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = user_id OR public.is_admin() OR public.is_superadmin())
  AND EXISTS (
    SELECT 1
    FROM public.metas meta
    WHERE meta.id = avaliacoes_anuais.meta_id
      AND public.can_access_responsavel(meta.responsavel)
  )
)
WITH CHECK (
  (auth.uid() = user_id OR public.is_admin() OR public.is_superadmin())
  AND EXISTS (
    SELECT 1
    FROM public.metas meta
    WHERE meta.id = avaliacoes_anuais.meta_id
      AND public.can_access_responsavel(meta.responsavel)
  )
);

CREATE POLICY "Admins can delete scoped avaliacoes_anuais"
ON public.avaliacoes_anuais
FOR DELETE
TO authenticated
USING (
  (public.is_admin() OR public.is_superadmin())
  AND EXISTS (
    SELECT 1
    FROM public.metas meta
    WHERE meta.id = avaliacoes_anuais.meta_id
      AND public.can_access_responsavel(meta.responsavel)
  )
);

CREATE POLICY "Users can view scoped acoes_status"
ON public.acoes_status
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.metas meta
    WHERE meta.id = acoes_status.meta_id
      AND public.can_access_responsavel(meta.responsavel)
  )
);

CREATE POLICY "Users can insert scoped acoes_status"
ON public.acoes_status
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.metas meta
    WHERE meta.id = acoes_status.meta_id
      AND public.can_access_responsavel(meta.responsavel)
  )
);

CREATE POLICY "Users can update scoped acoes_status"
ON public.acoes_status
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = user_id OR public.is_admin() OR public.is_superadmin())
  AND EXISTS (
    SELECT 1
    FROM public.metas meta
    WHERE meta.id = acoes_status.meta_id
      AND public.can_access_responsavel(meta.responsavel)
  )
)
WITH CHECK (
  (auth.uid() = user_id OR public.is_admin() OR public.is_superadmin())
  AND EXISTS (
    SELECT 1
    FROM public.metas meta
    WHERE meta.id = acoes_status.meta_id
      AND public.can_access_responsavel(meta.responsavel)
  )
);

CREATE POLICY "Admins can delete scoped acoes_status"
ON public.acoes_status
FOR DELETE
TO authenticated
USING (
  (public.is_admin() OR public.is_superadmin())
  AND EXISTS (
    SELECT 1
    FROM public.metas meta
    WHERE meta.id = acoes_status.meta_id
      AND public.can_access_responsavel(meta.responsavel)
  )
);

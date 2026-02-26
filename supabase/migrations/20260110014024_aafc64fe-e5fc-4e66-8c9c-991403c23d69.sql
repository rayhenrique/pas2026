
-- Drop existing INSERT policies and recreate to include superadmin
DROP POLICY IF EXISTS "Admins can insert eixos" ON public.eixos;
DROP POLICY IF EXISTS "Admins can update eixos" ON public.eixos;
DROP POLICY IF EXISTS "Admins can delete eixos" ON public.eixos;

DROP POLICY IF EXISTS "Admins can insert diretrizes" ON public.diretrizes;
DROP POLICY IF EXISTS "Admins can update diretrizes" ON public.diretrizes;
DROP POLICY IF EXISTS "Admins can delete diretrizes" ON public.diretrizes;

DROP POLICY IF EXISTS "Admins can insert metas" ON public.metas;
DROP POLICY IF EXISTS "Admins can update metas" ON public.metas;
DROP POLICY IF EXISTS "Admins can delete metas" ON public.metas;

DROP POLICY IF EXISTS "Admins can insert acoes" ON public.acoes;
DROP POLICY IF EXISTS "Admins can update acoes" ON public.acoes;
DROP POLICY IF EXISTS "Admins can delete acoes" ON public.acoes;

-- Recreate policies to include both admin and superadmin
CREATE POLICY "Admins can insert eixos" ON public.eixos
FOR INSERT WITH CHECK (is_admin() OR is_superadmin());

CREATE POLICY "Admins can update eixos" ON public.eixos
FOR UPDATE USING (is_admin() OR is_superadmin());

CREATE POLICY "Admins can delete eixos" ON public.eixos
FOR DELETE USING (is_admin() OR is_superadmin());

CREATE POLICY "Admins can insert diretrizes" ON public.diretrizes
FOR INSERT WITH CHECK (is_admin() OR is_superadmin());

CREATE POLICY "Admins can update diretrizes" ON public.diretrizes
FOR UPDATE USING (is_admin() OR is_superadmin());

CREATE POLICY "Admins can delete diretrizes" ON public.diretrizes
FOR DELETE USING (is_admin() OR is_superadmin());

CREATE POLICY "Admins can insert metas" ON public.metas
FOR INSERT WITH CHECK (is_admin() OR is_superadmin());

CREATE POLICY "Admins can update metas" ON public.metas
FOR UPDATE USING (is_admin() OR is_superadmin());

CREATE POLICY "Admins can delete metas" ON public.metas
FOR DELETE USING (is_admin() OR is_superadmin());

CREATE POLICY "Admins can insert acoes" ON public.acoes
FOR INSERT WITH CHECK (is_admin() OR is_superadmin());

CREATE POLICY "Admins can update acoes" ON public.acoes
FOR UPDATE USING (is_admin() OR is_superadmin());

CREATE POLICY "Admins can delete acoes" ON public.acoes
FOR DELETE USING (is_admin() OR is_superadmin());

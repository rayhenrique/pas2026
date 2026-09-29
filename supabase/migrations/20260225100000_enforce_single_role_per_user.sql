-- Enforce single role per user in public.user_roles
-- Priority rule when duplicates exist:
-- superadmin > admin > coordenador > gestor

WITH ranked_roles AS (
  SELECT
    id,
    user_id,
    role,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY
        CASE role
          WHEN 'superadmin' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'coordenador' THEN 3
          WHEN 'gestor' THEN 4
          ELSE 5
        END,
        created_at ASC
    ) AS rn
  FROM public.user_roles
)
DELETE FROM public.user_roles ur
USING ranked_roles rr
WHERE ur.id = rr.id
  AND rr.rn > 1;

DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  FOR constraint_record IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.user_roles'::regclass
      AND contype = 'u'
  LOOP
    EXECUTE format('ALTER TABLE public.user_roles DROP CONSTRAINT %I', constraint_record.conname);
  END LOOP;
END $$;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

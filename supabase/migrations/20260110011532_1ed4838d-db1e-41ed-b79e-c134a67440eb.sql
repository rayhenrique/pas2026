-- Criar tabela de configurações da aplicação
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name text NOT NULL DEFAULT 'PAS Digital',
  municipality text NOT NULL DEFAULT 'Teotônio Vilela',
  slogan text NOT NULL DEFAULT 'Programação Anual de Saúde',
  current_year integer NOT NULL DEFAULT 2026,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Qualquer usuário autenticado pode visualizar
CREATE POLICY "Authenticated users can view app_settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (true);

-- Apenas superadmin pode atualizar
CREATE POLICY "Superadmin can update app_settings"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

-- Apenas superadmin pode inserir
CREATE POLICY "Superadmin can insert app_settings"
ON public.app_settings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

-- Inserir configuração padrão
INSERT INTO public.app_settings (app_name, municipality, slogan, current_year)
VALUES ('PAS Digital', 'Teotônio Vilela', 'Programação Anual de Saúde', 2026);

-- Trigger para updated_at
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Atribuir role superadmin ao rayhenrique@gmail.com
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = 'rayhenrique@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'superadmin');
  END IF;
END $$;

-- Criar função para verificar superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'superadmin'
  )
$$;
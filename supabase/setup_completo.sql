-- =====================================================
-- ATENÇÃO: ARQUIVO LEGADO, MANTIDO APENAS COMO REFERÊNCIA.
-- NÃO EXECUTE EM PRODUÇÃO. USE supabase/migrations EM ORDEM.
-- PAS DIGITAL - SCRIPT COMPLETO DE SETUP DO BANCO
-- =====================================================

-- =========================================
-- 1. ENUM E TABELAS DE USUÁRIOS
-- =========================================

-- Criar/atualizar enum para roles (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'app_role'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'coordenador', 'gestor', 'superadmin');
  ELSE
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typname = 'app_role'
        AND n.nspname = 'public'
        AND e.enumlabel = 'superadmin'
    ) THEN
      ALTER TYPE public.app_role ADD VALUE 'superadmin';
    END IF;
  END IF;
END $$;

-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cargo TEXT,
  setor TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Criar tabela de roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'gestor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id)
);

-- =========================================
-- 2. FUNÇÕES DE SEGURANÇA
-- =========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Função para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Função para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- Função para verificar se é superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
$$;

-- Função para obter role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- 3. TABELAS DE DADOS (EIXOS, METAS, ETC)
-- =========================================

-- Tabela de eixos
CREATE TABLE public.eixos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero INTEGER NOT NULL,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(numero)
);

-- Tabela de diretrizes
CREATE TABLE public.diretrizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  eixo_id UUID NOT NULL REFERENCES public.eixos(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(eixo_id, numero)
);

-- Tabela de metas
CREATE TABLE public.metas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diretriz_id UUID NOT NULL REFERENCES public.diretrizes(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  indicador TEXT NOT NULL,
  meta_plano_2025 TEXT NOT NULL,
  unidade_medida TEXT NOT NULL DEFAULT '%',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(diretriz_id, numero)
);

-- Tabela de ações
CREATE TABLE public.acoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meta_id UUID NOT NULL REFERENCES public.metas(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(meta_id, numero)
);

-- =========================================
-- 4. TABELAS DE LANÇAMENTOS
-- =========================================

-- Tabela de lançamentos
CREATE TABLE public.lancamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meta_id TEXT NOT NULL,
  quadrimestre INTEGER NOT NULL CHECK (quadrimestre IN (1, 2, 3)),
  ano INTEGER NOT NULL DEFAULT 2026,
  resultado DECIMAL(10, 2),
  justificativa TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (meta_id, quadrimestre, ano)
);

-- Tabela de status das ações
CREATE TABLE public.acoes_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  acao_id TEXT NOT NULL,
  meta_id TEXT NOT NULL,
  concluida BOOLEAN NOT NULL DEFAULT false,
  ano INTEGER NOT NULL DEFAULT 2026,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (acao_id, ano)
);

-- =========================================
-- 5. TABELA DE HISTÓRICO (AUDITORIA)
-- =========================================

CREATE TABLE public.lancamentos_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lancamento_id UUID NOT NULL,
  user_id UUID NOT NULL,
  meta_id TEXT NOT NULL,
  quadrimestre INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  resultado_anterior NUMERIC,
  resultado_novo NUMERIC,
  justificativa_anterior TEXT,
  justificativa_nova TEXT,
  acao TEXT NOT NULL,
  alterado_por UUID NOT NULL,
  alterado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Função de log
CREATE OR REPLACE FUNCTION public.log_lancamento_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lancamentos_historico (
      lancamento_id, user_id, meta_id, quadrimestre, ano,
      resultado_anterior, resultado_novo,
      justificativa_anterior, justificativa_nova,
      acao, alterado_por
    ) VALUES (
      NEW.id, NEW.user_id, NEW.meta_id, NEW.quadrimestre, NEW.ano,
      NULL, NEW.resultado, NULL, NEW.justificativa, 'INSERT', NEW.user_id
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.resultado IS DISTINCT FROM NEW.resultado OR OLD.justificativa IS DISTINCT FROM NEW.justificativa THEN
      INSERT INTO public.lancamentos_historico (
        lancamento_id, user_id, meta_id, quadrimestre, ano,
        resultado_anterior, resultado_novo,
        justificativa_anterior, justificativa_nova,
        acao, alterado_por
      ) VALUES (
        NEW.id, NEW.user_id, NEW.meta_id, NEW.quadrimestre, NEW.ano,
        OLD.resultado, NEW.resultado, OLD.justificativa, NEW.justificativa,
        'UPDATE', auth.uid()
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.lancamentos_historico (
      lancamento_id, user_id, meta_id, quadrimestre, ano,
      resultado_anterior, resultado_novo,
      justificativa_anterior, justificativa_nova,
      acao, alterado_por
    ) VALUES (
      OLD.id, OLD.user_id, OLD.meta_id, OLD.quadrimestre, OLD.ano,
      OLD.resultado, NULL, OLD.justificativa, NULL, 'DELETE', auth.uid()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_log_lancamento_changes
AFTER INSERT OR UPDATE OR DELETE ON public.lancamentos
FOR EACH ROW EXECUTE FUNCTION public.log_lancamento_changes();

-- =========================================
-- 6. TABELA DE CONFIGURAÇÕES
-- =========================================

CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name text NOT NULL DEFAULT 'PAS Digital',
  municipality text NOT NULL DEFAULT 'Teotônio Vilela',
  slogan text NOT NULL DEFAULT 'Programação Anual de Saúde',
  current_year integer NOT NULL DEFAULT 2026,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Inserir configuração padrão
INSERT INTO public.app_settings (app_name, municipality, slogan, current_year)
VALUES ('PAS Digital', 'Teotônio Vilela', 'Programação Anual de Saúde', 2026);

-- =========================================
-- 7. HABILITAR RLS EM TODAS AS TABELAS
-- =========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eixos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diretrizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 8. POLÍTICAS RLS
-- =========================================

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (is_admin() OR is_superadmin());
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_superadmin());
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE TO authenticated USING (is_admin() OR is_superadmin());

-- User Roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (is_admin() OR is_superadmin());
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_superadmin());
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (is_admin() OR is_superadmin());
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (is_admin() OR is_superadmin());

-- Eixos, Diretrizes, Metas, Ações
CREATE POLICY "Authenticated users can view eixos" ON public.eixos FOR SELECT USING (true);
CREATE POLICY "Admins can insert eixos" ON public.eixos FOR INSERT WITH CHECK (is_admin() OR is_superadmin());
CREATE POLICY "Admins can update eixos" ON public.eixos FOR UPDATE USING (is_admin() OR is_superadmin());
CREATE POLICY "Admins can delete eixos" ON public.eixos FOR DELETE USING (is_admin() OR is_superadmin());

CREATE POLICY "Authenticated users can view diretrizes" ON public.diretrizes FOR SELECT USING (true);
CREATE POLICY "Admins can insert diretrizes" ON public.diretrizes FOR INSERT WITH CHECK (is_admin() OR is_superadmin());
CREATE POLICY "Admins can update diretrizes" ON public.diretrizes FOR UPDATE USING (is_admin() OR is_superadmin());
CREATE POLICY "Admins can delete diretrizes" ON public.diretrizes FOR DELETE USING (is_admin() OR is_superadmin());

CREATE POLICY "Authenticated users can view metas" ON public.metas FOR SELECT USING (true);
CREATE POLICY "Admins can insert metas" ON public.metas FOR INSERT WITH CHECK (is_admin() OR is_superadmin());
CREATE POLICY "Admins can update metas" ON public.metas FOR UPDATE USING (is_admin() OR is_superadmin());
CREATE POLICY "Admins can delete metas" ON public.metas FOR DELETE USING (is_admin() OR is_superadmin());

CREATE POLICY "Authenticated users can view acoes" ON public.acoes FOR SELECT USING (true);
CREATE POLICY "Admins can insert acoes" ON public.acoes FOR INSERT WITH CHECK (is_admin() OR is_superadmin());
CREATE POLICY "Admins can update acoes" ON public.acoes FOR UPDATE USING (is_admin() OR is_superadmin());
CREATE POLICY "Admins can delete acoes" ON public.acoes FOR DELETE USING (is_admin() OR is_superadmin());

-- Lançamentos
CREATE POLICY "Authenticated users can view lancamentos" ON public.lancamentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert lancamentos" ON public.lancamentos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lancamentos or admin" ON public.lancamentos FOR UPDATE TO authenticated USING (auth.uid() = user_id OR is_admin() OR is_superadmin());
CREATE POLICY "Admins can delete lancamentos" ON public.lancamentos FOR DELETE TO authenticated USING (is_admin() OR is_superadmin());

-- Ações Status
CREATE POLICY "Authenticated users can view acoes_status" ON public.acoes_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert acoes_status" ON public.acoes_status FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own acoes_status or admin" ON public.acoes_status FOR UPDATE TO authenticated USING (auth.uid() = user_id OR is_admin() OR is_superadmin());
CREATE POLICY "Admins can delete acoes_status" ON public.acoes_status FOR DELETE TO authenticated USING (is_admin() OR is_superadmin());

-- Histórico
CREATE POLICY "Authenticated users can view historico" ON public.lancamentos_historico FOR SELECT USING (true);
CREATE POLICY "System can insert historico" ON public.lancamentos_historico FOR INSERT WITH CHECK (true);
CREATE POLICY "Superadmin can delete historico" ON public.lancamentos_historico FOR DELETE USING (is_superadmin());

-- App Settings
CREATE POLICY "Authenticated users can view app_settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmin can update app_settings" ON public.app_settings FOR UPDATE TO authenticated USING (is_superadmin());
CREATE POLICY "Superadmin can insert app_settings" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (is_superadmin());

-- =========================================
-- 9. TRIGGERS DE UPDATED_AT
-- =========================================

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_eixos_updated_at BEFORE UPDATE ON public.eixos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_diretrizes_updated_at BEFORE UPDATE ON public.diretrizes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_metas_updated_at BEFORE UPDATE ON public.metas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_acoes_updated_at BEFORE UPDATE ON public.acoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lancamentos_updated_at BEFORE UPDATE ON public.lancamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_acoes_status_updated_at BEFORE UPDATE ON public.acoes_status FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- 10. ÍNDICES PARA PERFORMANCE
-- =========================================

CREATE INDEX idx_diretrizes_eixo_id ON public.diretrizes(eixo_id);
CREATE INDEX idx_metas_diretriz_id ON public.metas(diretriz_id);
CREATE INDEX idx_acoes_meta_id ON public.acoes(meta_id);
CREATE INDEX idx_lancamentos_meta_quad ON public.lancamentos(meta_id, quadrimestre, ano);
CREATE INDEX idx_lancamentos_user ON public.lancamentos(user_id);
CREATE INDEX idx_acoes_status_acao ON public.acoes_status(acao_id, ano);
CREATE INDEX idx_acoes_status_meta ON public.acoes_status(meta_id);
CREATE INDEX idx_lancamentos_historico_lancamento_id ON public.lancamentos_historico(lancamento_id);
CREATE INDEX idx_lancamentos_historico_meta_id ON public.lancamentos_historico(meta_id);
CREATE INDEX idx_lancamentos_historico_alterado_em ON public.lancamentos_historico(alterado_em DESC);

-- =====================================================
-- FIM DO SCRIPT - Banco configurado com sucesso!
-- =====================================================

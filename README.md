# PAS Digital 2026 - Programação Anual de Saúde

Sistema de gestão da Programação Anual de Saúde (PAS), desenvolvido para o exercício de 2026. O sistema permite o gerenciamento completo de metas, ações, diretrizes e eixos estratégicos, com controle de acesso granular e auditoria.

## 🚀 Tecnologias

Este projeto foi construído com as seguintes tecnologias modernas:

- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Backend/Database**: [Supabase](https://supabase.com/)
- **Gerenciamento de Estado**: [React Query](https://tanstack.com/query/latest)

## 🛡️ Controle de Acesso (RBAC)

O sistema implementa um Controle de Acesso Baseado em Função (RBAC) rigoroso, com quatro níveis de permissão:

| Função | Descrição | Permissões Principais |
| :--- | :--- | :--- |
| **Gestor** | Visualizador | ✅ Dashboard, Relatórios, Backup (Audit). <br> ❌ Edição de Lançamentos (Apenas Leitura). <br> ❌ Gestão de Usuários. |
| **Coordenador** | Operador | ✅ Edição de Lançamentos (Resultados e Justificativas). <br> ❌ Acesso a Backup e Auditoria. <br> ❌ Gestão Administrativa. |
| **Administrador** | Gerente | ✅ Acesso a todos os módulos operacionais. <br> ✅ Gestão de Usuários (exceto Super Admins). <br> ✅ Restaurar Backups. <br> ✅ Gerenciar Metas do PAS. |
| **Super Admin** | Controle Total | ✅ Acesso Irrestrito. <br> ✅ Gestão de outros Super Admins. <br> ✅ Acesso à página de Configurações Globais. |

> ✅ **Regra de modelo atual**: cada usuário possui **uma única role ativa** (`gestor`, `coordenador`, `admin` ou `superadmin`).

### Regras de Segurança Específicas
- **Backup**: A opção de "Restaurar Backup" (Importar) é visível **apenas** para Administradores e Super Admins.
- **Super Admins**: Apenas um Super Admin pode editar, desativar ou redefinir a senha de outro Super Admin.
- **Bootstrap administrativo**: a ação inicial de promoção (`make-admin`) só funciona quando **não existe nenhum usuário privilegiado** (`admin` ou `superadmin`) no banco.

## ✨ Funcionalidades Principais

1.  **Dashboard Interativo**: Visualização em tempo real do progresso das metas e ações.
2.  **Lançamento de Resultados**: Interface para registro de resultados quadrimestrais com suporte a justificativas e status de ações.
3.  **Relatórios**: Geração de relatórios detalhados para acompanhamento.
4.  **Gerenciar PAS**: CRUD completo para Eixos, Diretrizes, Metas e Ações.
5.  **Backup e Auditoria**:
    *   Exportação completa dos dados do sistema (JSON).
    *   Restauração de dados (Restrito a Admins).
    *   Histórico detalhado de todas as alterações realizadas (Quem, Quando, O Quê).
6.  **Gerenciamento de Usuários**: Interface para criar, editar e controlar o acesso dos usuários.

## 🔧 Como Executar Localmente

Siga os passos abaixo para rodar o projeto em sua máquina:

### Pré-requisitos
- Node.js & npm instalados
- Supabase CLI (para migrations e functions)
- Variáveis de ambiente configuradas no `.env`

### Instalação

```sh
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>

# 2. Entre na pasta do projeto
cd pasdigital

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:8080`.

## 🗄️ Banco de Dados (Supabase)

### Cenário A: Banco novo (sem schema anterior)

Use o script completo:

```sql
-- Executar no SQL Editor do Supabase
supabase/setup_completo.sql
```

### Cenário B: Banco já existente (produção/homolog com schema criado)

**Não** execute `setup_completo.sql` inteiro novamente.  
Aplique apenas as migrations pendentes da pasta `supabase/migrations` (principalmente as mais recentes).

Migração importante recente:

- `20260225100000_enforce_single_role_per_user.sql`  
  Normaliza `user_roles` para **uma role por usuário** (`UNIQUE (user_id)`), com deduplicação por prioridade:
  `superadmin > admin > coordenador > gestor`.

## 📦 Build e Deploy

Para gerar a versão de produção:

```sh
npm run build
```

Os arquivos estáticos serão gerados na pasta `dist/`.

## ✅ Validação local

```sh
npm run lint
npm run test
npm run build
```

## ☁️ Deploy Supabase Edge Functions

O projeto utiliza Edge Functions do Supabase para gerenciamento de usuários. Para fazer deploy das funções:

```sh
# Login no Supabase (se necessário)
npx supabase login

# Linkar com o projeto
npx supabase link --project-ref <PROJECT_REF>

# Deploy da função manage-users
npx supabase functions deploy manage-users --no-verify-jwt
```

> ⚠️ **IMPORTANTE**: O flag `--no-verify-jwt` é **obrigatório** para a função `manage-users`. Sem ele, o Supabase Edge Runtime rejeita os tokens JWT antes da função executar, causando erro 401 "Invalid JWT". A função faz sua própria validação de JWT internamente.

## 🔁 Fluxo de atualização recomendado (ambiente existente)

1. Aplicar migrations pendentes (`supabase/migrations`).
2. Fazer deploy da Edge Function `manage-users`.
3. Fazer deploy do frontend.

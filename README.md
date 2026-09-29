# PAS Digital 2026-2029

Sistema de gestão da Programação Anual de Saúde (PAS) refatorado para o modelo anual do documento `MATRIZ DOMI PMS 2026-2029`. O projeto usa React + Vite no frontend e Supabase como backend, autenticação, banco e Edge Functions.

## Visão geral

- Modelo atual: `Diretriz > Objetivo > Meta > Ação`
- Acompanhamento: anual, com anos de referência `2026`, `2027`, `2028` e `2029`
- Estrutura de acompanhamento:
  - `avaliacoes_anuais`
  - `acoes_status`
  - `setores_responsaveis`
- Controle global de ano via `SelectedYearContext`
- Seed oficial gerado a partir do documento da matriz PMS

## Stack

- React 18
- Vite 7
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Supabase
- Vitest

## Perfis e acesso

| Perfil | Descrição | Acesso principal |
| --- | --- | --- |
| `gestor` | leitura | dashboard, relatórios e visualização conforme setor |
| `coordenador` | operação | lançamentos anuais e acompanhamento do próprio setor |
| `admin` | gestão | gerenciar PAS, usuários, setores responsáveis, backup/auditoria |
| `superadmin` | controle total | tudo que o admin faz + configurações globais + gestão de superadmins |

### Regras importantes

- `gestor` e `coordenador` devem estar vinculados a um `setor responsável`
- o escopo por setor é aplicado no frontend e também por RLS no Supabase
- `backup-auditoria` é restrito a `admin` e `superadmin`
- `superadmin` pode operar o módulo de setores e gerir outros superadmins

## Estrutura de dados atual

### Tabelas principais

- `diretrizes`
- `objetivos`
- `metas`
- `acoes`
- `avaliacoes_anuais`
- `acoes_status`
- `setores_responsaveis`
- `profiles`
- `user_roles`
- `app_settings`
- `avaliacoes_anuais_audit`

### Campos relevantes

As metas trabalham com:

- `indicador`
- `criterios_avaliacao`
- `meta_2026`
- `meta_2027`
- `meta_2028`
- `meta_2029`
- `meta_plano_2026_2029`
- `meta_pas_2026`
- `unidade_medida`
- `responsavel`

Os setores responsáveis usam:

- `nome`
- `nome_normalizado`
- `ativo`

## Executando localmente

### Pré-requisitos

- Node.js 22+
- npm
- um projeto Supabase já criado

### Variáveis de ambiente

Crie `.env.local` na raiz:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel
```

Também é aceito:

```env
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sua-chave-publicavel
```

Se as variáveis não existirem, o app mostra uma tela de configuração local em vez de quebrar no bootstrap.

### Instalação

```sh
git clone <URL_DO_REPOSITORIO>
cd pasdigital
npm ci
npm run dev
```

Aplicação local:

```txt
http://localhost:8080
```

## Migrations do Supabase

### Fluxo recomendado para ambiente atual

Execute nesta ordem:

1. [20260321120000_refactor_pms_annual_model.sql](./supabase/migrations/20260321120000_refactor_pms_annual_model.sql)
2. [20260321143000_scope_access_by_profile_setor.sql](./supabase/migrations/20260321143000_scope_access_by_profile_setor.sql)
3. [20260321153000_create_setores_responsaveis.sql](./supabase/migrations/20260321153000_create_setores_responsaveis.sql)
4. [20260321170000_fix_setores_responsaveis_permissions_and_normalization.sql](./supabase/migrations/20260321170000_fix_setores_responsaveis_permissions_and_normalization.sql)
5. [20260929160000_harden_authorization_and_integrity.sql](./supabase/migrations/20260929160000_harden_authorization_and_integrity.sql)
6. [20260929161000_add_pending_evaluation_statuses.sql](./supabase/migrations/20260929161000_add_pending_evaluation_statuses.sql)
7. [20260929162000_backfill_pending_evaluation_statuses.sql](./supabase/migrations/20260929162000_backfill_pending_evaluation_statuses.sql)
8. [20260929163000_transactional_restore_and_audit.sql](./supabase/migrations/20260929163000_transactional_restore_and_audit.sql)
9. [20260929164000_transactional_tree_import.sql](./supabase/migrations/20260929164000_transactional_tree_import.sql)

### Observações

- `setup_completo.sql` é legado e não deve ser usado em produção; aplique as migrations incrementais acima
- as migrations recentes já foram endurecidas para suportar melhor execução manual no SQL Editor
- se o banco estiver em estado intermediário, aplique as migrations acima por completo antes do seed

## Seed oficial

O seed atual foi gerado a partir do documento oficial `MATRIZ DOMI PMS 2026 2029 TV ATUALIZADA.docx`.

Arquivos relacionados:

- [supabase/seed.sql](./supabase/seed.sql)
- [scripts/generate-supabase-seed.mjs](./scripts/generate-supabase-seed.mjs)
- [src/data/pasDataSeed.ts](./src/data/pasDataSeed.ts)
- [src/data/pasMetaDetails.ts](./src/data/pasMetaDetails.ts)

### Regenerar o seed

```sh
npm run seed:generate
```

### Aplicar o seed

Depois das migrations, execute o conteúdo de `supabase/seed.sql` no SQL Editor do Supabase.

O seed atual recria:

- `8` diretrizes
- `9` objetivos
- `72` metas
- `211` ações

## Edge Function

O projeto usa a função `manage-users`.

Deploy:

```sh
npx supabase login
npx supabase link --project-ref msnnttvakaaggpjcbafv
npx supabase functions deploy manage-users --no-verify-jwt
```

> O `--no-verify-jwt` é obrigatório porque a função faz a própria validação de autorização.
> A versão oficial da função está em `supabase/functions/manage-users`.

## Scripts úteis

```sh
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run audit
npm run seed:generate
```

## Validação recomendada

Antes de publicar:

```sh
npm run typecheck
npm run lint
npm run test
npm run build
```

## Deploy do frontend

O frontend gerado pelo Vite é estático. O build sai em `dist/`.

```sh
npm run build
```

Depois publique o conteúdo de `dist/` no servidor web da sua infraestrutura.

Para um passo a passo operacional, veja [deploy.md](./deploy.md).

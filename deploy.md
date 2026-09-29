# Manual de Deploy (Hostinger VPS + CloudPanel + PM2)

Este guia documenta o deploy manual do **PAS Digital** em uma VPS Hostinger usando **CloudPanel** e **PM2**, já considerando o estado atual do projeto PMS 2026-2029.

## Resumo

O deploy completo tem quatro partes:

1. aplicar as migrations do Supabase
2. aplicar o `seed.sql`, quando necessário
3. fazer deploy da Edge Function `manage-users`
4. publicar o frontend Vite na VPS

## 1. Pré-requisitos

- VPS ativa com CloudPanel instalado
- domínio/subdomínio apontando para o IP da VPS
- site Node.js criado no CloudPanel
- repositório Git acessível na VPS
- Node `22 LTS`
- Supabase configurado
- projeto validado localmente

Validação mínima antes do deploy:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## 2. Segurança inicial

- troque imediatamente senhas expostas ou compartilhadas
- use senha forte para o usuário SSH do site
- restrinja acesso SSH por IP quando possível
- mantenha o `SUPABASE_SERVICE_ROLE_KEY` apenas em ambiente seguro quando for usar CLI/funções

## 3. Configuração no CloudPanel

Crie o site Node.js com:

- domínio: `pasdigital.kltecnologia.com`
- Node: `22 LTS`
- porta da aplicação: `3012`
- usuário do site: usuário dedicado

Depois:

- ative SSL com Let's Encrypt
- garanta que o DNS está correto com registro `A` apontando para o IP da VPS

## 4. Primeiro deploy (SSH)

Conecte na VPS com o usuário do site:

```bash
ssh <usuario_do_site>@<ip_da_vps>
```

Vá para o diretório do site:

```bash
cd /home/<usuario_do_site>/htdocs
git clone <url_do_repositorio> app
cd app
```

Instale dependências e gere build:

```bash
npm ci
npm run build
```

## 5. Variáveis de ambiente

Crie o `.env` de produção na raiz do app:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel
```

Também funciona:

```env
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sua-chave-publicavel
```

## 6. Banco e Edge Functions (Supabase)

Projeto Supabase alvo atual:

```txt
msnnttvakaaggpjcbafv
```

Use esse `project-ref` ao vincular a CLI. A Edge Function oficial do projeto fica em
`supabase/functions/manage-users`; ignore a pasta raiz `manage-users`, caso ela exista
no ambiente local, pois ela é uma cópia antiga.

### Ordem recomendada das migrations

Execute nesta ordem:

1. `supabase/migrations/20260321120000_refactor_pms_annual_model.sql`
2. `supabase/migrations/20260321143000_scope_access_by_profile_setor.sql`
3. `supabase/migrations/20260321153000_create_setores_responsaveis.sql`
4. `supabase/migrations/20260321170000_fix_setores_responsaveis_permissions_and_normalization.sql`
5. `supabase/migrations/20260929160000_harden_authorization_and_integrity.sql`
6. `supabase/migrations/20260929161000_add_pending_evaluation_statuses.sql`
7. `supabase/migrations/20260929162000_backfill_pending_evaluation_statuses.sql`
8. `supabase/migrations/20260929163000_transactional_restore_and_audit.sql`
9. `supabase/migrations/20260929164000_transactional_tree_import.sql`

### Aplicação manual via SQL Editor

Se você estiver aplicando manualmente:

1. rode cada migration inteira, do início ao fim
2. respeite a ordem acima
3. só depois aplique o seed

### Seed

O seed oficial atual está em:

```txt
supabase/seed.sql
```

Use quando:

- o ambiente é novo
- o schema anual foi recriado
- o catálogo oficial do PAS mudou e precisa ser sincronizado

Execução:

```txt
Cole o conteúdo de supabase/seed.sql no SQL Editor do Supabase
```

> O seed faz `TRUNCATE` das tabelas anuais e recria a estrutura base do PAS.

### Edge Function

Para a função de usuários:

```bash
npx supabase login
npx supabase link --project-ref msnnttvakaaggpjcbafv
npx supabase functions deploy manage-users --no-verify-jwt
```

Importante:

- `--no-verify-jwt` é obrigatório
- a função faz validação própria de autorização

## 7. Servidor Node para SPA

Para o cenário específico da sua VPS com CloudPanel + PM2, o projeto já versiona um `server.js` simples para servir `dist/` com fallback de rota.

O arquivo já existe na raiz do projeto e segue este formato:

```js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3012;

app.use(express.static(path.join(__dirname, "dist")));

// SPA fallback sem rota "*"
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, "127.0.0.1", () => {
  console.log(`PAS Digital rodando na porta ${port}`);
});
```

> O projeto continua sendo um frontend Vite estático, mas esse `server.js` é um wrapper simples para servir o `dist/` no seu ambiente com PM2. Como ele agora faz parte do repositório, o `npm ci` já instala o `express` automaticamente.

## 8. PM2 (gerenciamento do processo)

Instale PM2:

```bash
npm i -g pm2
```

Suba a aplicação:

```bash
cd /home/<usuario_do_site>/htdocs/app
PORT=3012 pm2 start server.js --name pasdigital
pm2 save
pm2 startup
```

> O `pm2 startup` retorna um comando adicional. Execute esse comando para habilitar start automático no boot.
>
> CloudPanel, `server.js` e PM2 devem usar a mesma porta: `3012`.

Comandos úteis:

```bash
pm2 status
pm2 logs pasdigital
PORT=3012 pm2 restart pasdigital --update-env
pm2 stop pasdigital
pm2 delete pasdigital
```

## 9. Deploy de atualização (manual)

```bash
ssh <usuario_do_site>@<ip_da_vps>
cd /home/<usuario_do_site>/htdocs/app
git pull
npm ci
npm run build
PORT=3012 pm2 restart pasdigital --update-env
```

Se houve mudança no backend:

1. aplique migrations novas no Supabase
2. reaplique `supabase/seed.sql` se a estrutura oficial do PAS mudou
3. faça deploy da Edge Function `manage-users` se ela mudou

Checklist rápido de deploy:

1. confirmar que o `git pull` trouxe a versão nova sem conflitos
2. rodar `npm ci` e `npm run build` na VPS
3. reiniciar com `PORT=3012 pm2 restart pasdigital --update-env`
4. se houve mudança estrutural no banco, aplicar as migrations no projeto Supabase correto
5. se houve mudança no catálogo base, reaplicar `supabase/seed.sql`
6. se houve alteração manual de schema no SQL Editor, rodar:

```sql
select pg_notify('pgrst', 'reload schema');
```

7. fazer `Ctrl+F5` no navegador antes de validar os fluxos principais

## 10. Verificações pós-deploy

- `https://pasdigital.kltecnologia.com` abre sem erro
- login funciona
- dashboard carrega
- troca de ano funciona
- lançamentos anuais salvam corretamente
- página admin respeita RBAC
- `setores responsáveis` funciona
- backup/auditoria segue permissões
- `pm2 logs pasdigital` sem erros críticos

## 11. Problemas comuns

### `supabaseUrl is required`

As variáveis `VITE_SUPABASE_URL` e chave pública não foram configuradas corretamente.

### `404` para `objetivos` ou `avaliacoes_anuais`

As migrations anuais ainda não foram aplicadas no Supabase.

### erro com `status_atingimento` ou coluna nova não encontrada

O banco já pode ter sido alterado, mas o PostgREST ainda está com schema cache antigo.

Rode no SQL Editor do projeto Supabase correto:

```sql
select pg_notify('pgrst', 'reload schema');
```

Depois aguarde alguns segundos e recarregue a página com `Ctrl+F5`.

### erro com `nome_normalizado`

As migrations de setores ainda não foram aplicadas:

- `20260321153000_create_setores_responsaveis.sql`
- `20260321170000_fix_setores_responsaveis_permissions_and_normalization.sql`

### select de responsável vazio

O seed não foi aplicado, ou a tabela `setores_responsaveis` está vazia.

### `502 Bad Gateway`

Na prática, quase sempre é desencontro de porta entre CloudPanel, `server.js` e PM2.

Confira se todos estão usando `3012` e reinicie com:

```bash
PORT=3012 pm2 restart pasdigital --update-env
```

## 12. Rollback rápido

```bash
cd /home/<usuario_do_site>/htdocs/app
git log --oneline -n 5
git checkout <commit_anterior_estavel>
npm ci
npm run build
PORT=3012 pm2 restart pasdigital --update-env
```

Se o rollback envolver banco:

- rever as migrations aplicadas
- restaurar um backup compatível
- reaplicar `supabase/seed.sql` se necessário

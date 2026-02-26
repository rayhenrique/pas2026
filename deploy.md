# Manual de Deploy (Hostinger VPS + CloudPanel + PM2)

Este guia documenta o deploy manual do **PAS Digital** em uma VPS Hostinger usando **CloudPanel** e **PM2**.

## 1. Pré-requisitos

- VPS ativa com CloudPanel instalado.
- Domínio/subdomínio apontando para o IP da VPS.
- Site Node.js criado no CloudPanel.
- Repositório Git acessível na VPS.
- Projeto validado localmente (`npm run build`).

## 2. Segurança inicial

- Troque imediatamente senhas expostas ou compartilhadas.
- Use senha forte para o usuário SSH do site.
- Restrinja acesso SSH por IP quando possível.

## 3. Configuração no CloudPanel

Crie o site Node.js com:

- Domínio: `pasdigital.kltecnologia.com`
- Node: `22 LTS`
- Porta da aplicação: `3012`
- Usuário do site: usuário dedicado

Depois:

- Ative SSL (Let's Encrypt).
- Garanta que o domínio está com DNS correto (`A` para IP da VPS).

## 4. Primeiro deploy (SSH)

Conecte na VPS com o usuário do site:

```bash
ssh <usuario_do_site>@<ip_da_vps>
```

Vá para o diretório web do site:

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
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

## 6. Servidor Node para SPA

Para Vite em produção, mantenha um servidor simples para servir `dist/` com fallback de rota.

Crie `server.js`:

```js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3012;

app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`PAS Digital rodando na porta ${port}`);
});
```

Instale o `express`:

```bash
npm i express
```

## 7. PM2 (gerenciamento do processo)

Instale PM2:

```bash
npm i -g pm2
```

Suba a aplicação:

```bash
cd /home/<usuario_do_site>/htdocs/app
PORT=3011 pm2 start server.js --name pasdigital
pm2 save
pm2 startup
```

> O `pm2 startup` retorna um comando adicional. Execute esse comando para habilitar start automático no boot.

Comandos úteis:

```bash
pm2 status
pm2 logs pasdigital
pm2 restart pasdigital
pm2 stop pasdigital
pm2 delete pasdigital
```

## 8. Deploy de atualização (manual)

```bash
ssh <usuario_do_site>@<ip_da_vps>
cd /home/<usuario_do_site>/htdocs/app
git pull
npm ci
npm run build
pm2 restart pasdigital
```

## 9. Banco e Edge Functions (Supabase)

Em ambiente já existente:

- **não** rode `supabase/setup_completo.sql` completo.
- aplique apenas migrations pendentes em `supabase/migrations`.

Para função de usuários:

```bash
supabase functions deploy manage-users --no-verify-jwt
```

## 10. Verificações pós-deploy

- `https://pasdigital.kltecnologia.com` abre sem erro.
- Login funciona.
- Página admin respeita RBAC.
- Backup/Auditoria segue permissões.
- `pm2 logs pasdigital` sem erros críticos.

## 11. Rollback rápido

```bash
cd /home/<usuario_do_site>/htdocs/app
git log --oneline -n 5
git checkout <commit_anterior_estavel>
npm ci
npm run build
pm2 restart pasdigital
```


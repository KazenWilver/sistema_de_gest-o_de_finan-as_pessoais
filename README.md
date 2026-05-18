# SGFP — Sistema de Gestão Financeira Pessoal

Mono-repositório do **Lab #04 (ISPTEC)**: API REST em **PHP** (sem framework), base de dados **MySQL** e interface **Angular**.

## Requisitos

- **PHP** 8.1+ (extensões habituais: `pdo_mysql`, `openssl`, `json`, `mbstring`)
- **MySQL** 8+ (ou compatível)
- **Node.js** 18+ e **npm**

## 1. Base de dados

1. Crie a base de dados (exemplo: `sgfp`):

   ```sql
   CREATE DATABASE sgfp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Importe o schema e o seed **por esta ordem** (na **raiz do repositório**, onde está a pasta `database/`):

   ```bash
   mysql -u root -p sgfp < database/schema.sql
   mysql -u root -p sgfp < database/seed.sql
   ```

**Utilizadores de desenvolvimento** (após o seed; password comum):

| Email               | Papel  | Password          |
|---------------------|--------|-------------------|
| `admin@sgfp.local`  | admin  | `devpassword123` |
| `user@sgfp.local`   | user   | `devpassword123` |

## 2. Backend (PHP)

1. Na pasta `backend`, copie o ficheiro de ambiente:

   ```bash
   copy .env.example .env
   ```

2. Edite `backend/.env` e ajuste pelo menos:

   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` — ligação ao MySQL  
   - `JWT_SECRET` — **mínimo 16 caracteres** (use um segredo longo em produção)  
   - `CORS_ORIGIN` — origem do Angular em desenvolvimento, por exemplo `http://localhost:4200`

3. Servidor incorporado PHP (usa `router.php` para encaminhar tudo ao `index.php`):

   ```bash
   cd backend
   php -S localhost:8080 -t public public/router.php
   ```

A API fica disponível na raiz URL (ex.: `http://localhost:8080/auth/login`).

### Notas rápidas

- Respostas JSON seguem o envelope `{ status, data, message, errors }` (exceto **CSV/PDF**, que são ficheiros em bruto para download).
- `APP_ENV=development` expõe mensagens mais detalhadas em erros não tratados.
- Taxas de câmbio: **Frankfurter** (`CurrencyService`), com cache na tabela `currency_rates`.

## 3. Frontend (Angular)

1. Dependências:

   ```bash
   cd frontend
   npm install
   ```

2. Servidor de desenvolvimento (configuração `development` usa `environment.development.ts` com `apiUrl: http://localhost:8080`):

   ```bash
   npx ng serve
   ```

   Abra `http://localhost:4200`.

3. Build de produção:

   ```bash
   npx ng build --configuration=production
   ```

   Artefactos em `frontend/dist/frontend`. Defina em `frontend/src/environments/environment.ts` a URL real da API em produção.

## Estrutura do repositório

| Pasta        | Conteúdo                                              |
|-------------|-------------------------------------------------------|
| `database/` | `schema.sql`, `seed.sql`                              |
| `backend/`  | Front controller (`public/index.php`), serviços, repositórios |
| `frontend/` | Angular 18 standalone, rotas lazy, ngx-translate     |

## O que está implementado (sumário)

- Autenticação: registo, login, JWT, recuperação/redefinição de password com token na BD (`users.reset_token*`).
- Domínio: categorias por utilizador (com seed no registo), transações com `amount_base`, orçamentos, metas (`goals`) e relatórios (resumo, por categoria, tendência).
- Dashboard com totais do mês, movimentos recentes e estado dos orçamentos ativos.
- Integração externa: taxas de câmbio (Frankfurter) com persistência local.
- Admin (JWT + role): listagem de utilizadores e estatísticas agregadas.
- Exportação: CSV e PDF (PDF via classe `SimplePdf` em PHP, sem Composer obrigatório).
- Frontend: modo claro/escuro, ngx-translate **PT / EN**, gráficos (Chart.js) em dashboard e relatórios.

## Itens opcionais / não implementados aqui

- **IA runtime** (`/ai`, insights): definido como opcional no `plano_definitivo.txt`; variáveis `AI_*` existem apenas como placeholders no `.env.example`.
- **Contas financeiras** (ligações extra às transações): marcado como opcional no plano fusão — não há tabela nem UI dedicada neste projeto.
- **Logs de exportação**, **scraping**, servidores de produção Apache/Nginx**: não fazem parte do núcleo entregue; use o PHP built-in apenas para desenvolvimento.

---

Documento de requisitos detalhado: `plano_definitivo.txt`.

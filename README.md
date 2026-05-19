# SGFP — Sistema de Gestão Financeira Pessoal

Sistema web de gestão financeira pessoal desenvolvido para o Laboratório #04 do ISPTEC.

## 📋 Pré-requisitos

- **PHP** 8.0+ com extensão `pdo_mysql`
- **MySQL** 5.7+ ou MariaDB 10.3+
- **Node.js** 18+ e npm
- **XAMPP/WAMP** (opcional, inclui PHP + MySQL)

## 🚀 Como Executar

### Passo 1 — Base de Dados

Abra o MySQL (via XAMPP, terminal, ou phpMyAdmin) e execute:

```sql
-- Criar a base de dados
CREATE DATABASE IF NOT EXISTS sgfp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sgfp_db;

-- Executar o schema (copie o conteúdo de database/schema.sql)
SOURCE database/schema.sql;

-- Inserir dados de demonstração
SOURCE database/seed.sql;
```

Ou via terminal:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p sgfp_db < database/seed.sql
```

### Passo 2 — Backend PHP

```bash
# Entrar na pasta do backend
cd backend

# Verificar o ficheiro .env (ajustar DB_USER e DB_PASS se necessário)
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=sgfp_db
# DB_USER=root
# DB_PASS=

# Iniciar o servidor PHP embutido na porta 8000
php -S localhost:8000 -t public
```

O backend estará disponível em: **http://localhost:8000**

### Passo 3 — Frontend Angular

```bash
# Entrar na pasta do frontend
cd frontend

# Instalar dependências (apenas na primeira vez)
npm install

# Iniciar o servidor de desenvolvimento
npm start
```

O frontend estará disponível em: **http://localhost:4200**

## 🔑 Credenciais de Demo

| Utilizador | Email | Password |
|---|---|---|
| Admin | admin@sgfp.com | admin123 |
| Demo User | demo@sgfp.com | demo123 |

## 📁 Estrutura do Projecto

```
├── database/
│   ├── schema.sql          # Esquema da base de dados (7 tabelas)
│   └── seed.sql            # Dados de demonstração
├── backend/
│   ├── .env                # Variáveis de ambiente
│   ├── public/index.php    # Front Controller (ponto de entrada)
│   └── app/
│       ├── Config/         # Config + Database PDO
│       ├── Core/           # Router, Request, Response
│       ├── Middleware/      # CORS, Auth JWT, Admin
│       ├── Controllers/    # 11 controllers REST
│       ├── Services/       # Lógica de negócio
│       ├── Repositories/   # Acesso a dados (SQL)
│       ├── Helpers/        # JWT, Validator
│       └── routes.php      # Definição de todas as rotas API
├── frontend/
│   └── src/app/
│       ├── core/           # Services, Guards, Interceptor, Models
│       ├── shared/         # Shell (sidebar + header)
│       └── features/       # Dashboard, Transactions, Accounts, etc.
```

## 🛠️ Tecnologias

- **Backend:** PHP Puro (sem frameworks), MySQL, JWT
- **Frontend:** Angular 20, TypeScript, SCSS
- **Design:** Apple-inspired (Inter font, #0071E3, glassmorphism)

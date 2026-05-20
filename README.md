# 💎 SGFP — Sistema de Gestão Financeira Pessoal

[![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![PHP](https://img.shields.io/badge/PHP-8.0+-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-3.7+-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

O **SGFP** é um sistema web moderno e robusto de gestão de finanças pessoais desenvolvido para o Laboratório #04 da cadeira de Engenharia de Software II do **ISPTEC**. A aplicação foi projetada sob uma estética premium de inspiração Apple, suportando múltiplos idiomas dinamicamente, gráficos interativos e controles rigorosos de orçamento.

---

## 🌟 Funcionalidades Principais e Melhorias Recentes

### 🌍 1. Internacionalização Reativa & Dinâmica (i18n)
* **Arquitetura Baseada em JSON**: Toda a engine de tradução foi migrada de chaves estáticas em código para dicionários JSON externos carregados assincronamente (`pt.json`, `en.json`, `es.json`, `fr.json`, `ru.json`, `ja.json`, `it.json`) a partir de `/assets/i18n/`.
* **Propagação Instantânea (Zoneless)**: O serviço `I18nService` utiliza o `HttpClient` de forma otimizada e dispara `ApplicationRef.tick()` para forçar a reavaliação instantânea do DOM de forma limpa no ecossistema zoneless do Angular 19/20.
* **Mapeamento de Categorias**: Transações provenientes da base de dados (ex: "Alimentação") são mapeadas e traduzidas dinamicamente para o idioma selecionado (ex: "Food", "Nourriture", etc.) nos gráficos, tabelas e relatórios.

### 📊 2. Visualização de Dados Profissional (Chart.js)
* **Tendência Mensal (Line Chart)**: Gráfico de linhas dinâmico com curvas suaves (tensionadas), preenchimento gradiente semitransparente sob as linhas e tooltips inteligentes.
* **Breakdown de Despesas (Doughnut & Pie Charts)**: Divisão percentual e de valor por categorias ativas. Resolve o bug do agrupamento "Sem Categoria" associando corretamente as junções relacionais no SQL.
* **Comparativo de Saldos (Bar Chart)**: Visualização em tempo real das receitas vs despesas consolidadas nos relatórios mensais.
* **Responsividade Gráfica & Temas**: Gráficos equipados com `maintainAspectRatio: false` para visualização perfeita em telemóveis e tablets, com atualização dinâmica de cores de grade e fontes ao alternar entre os temas **Claro (Light)** e **Escuro (Dark)**.

### 🛡️ 3. Robustez, Segurança & UX Premium
* **Validação de Formulários Completa**: Intercepção e validação local nos modais de criação/edição (Transações, Contas e Orçamentos). Exibição de bordas vermelhas com a classe `.is-invalid` e mensagens de ajuda dinâmicas debaixo de cada campo ausente ou incorreto, mitigando erros inesperados de API.
* **ErrorInterceptor (Sessão Segura)**: Um interceptor global no Angular deteta respostas HTTP `401 Unauthorized`. Se a sessão JWT expirar ou for inválida, ele expulsa o utilizador de forma segura e redireciona-o para o Login, evitando que a aplicação fique presa num ecrã em branco.
* **Middleware de Atividade do Utilizador**: O backend em PHP valida a coluna `is_active` na tabela de utilizadores a cada chamada de API protegida. Utilizadores desativados pelo painel administrativo têm o seu acesso imediatamente revogado no próximo pedido.
* **Credenciais Erradas com Animação Shake**: O cartão de Login e de Registo vibra fisicamente em caso de erro através de micro-animações CSS `@keyframes shake` de alto padrão visual.

---

## 🛠️ Tecnologias Utilizadas

* **Backend**: PHP Puro 8.0+ (padrão MVC sem frameworks pesados, rotas personalizadas, PDO nativo e tokens JWT).
* **Frontend**: Angular v19/20, TypeScript, SCSS (Arquitetura de componentes limpa, roteamento modular e reatividade com RxJS).
* **Base de Dados**: MySQL 5.7+ / MariaDB com suporte a chaves estrangeiras e integridade referencial.
* **Visualização**: Chart.js integrado de forma reativa a ciclos de vida de componentes Angular.

---

## 🚀 Como Configurar e Executar

### 🖥️ Cenário A: Utilizadores de WAMP Server / XAMPP (Windows)

1. **Configuração da Base de Dados**:
   * Certifique-se de que os serviços do **Apache** e **MySQL** estão em execução no painel do WAMP/XAMPP.
   * Aceda ao **phpMyAdmin** (`http://localhost/phpmyadmin`) ou ferramenta similar (DBeaver, HeidiSQL).
   * Crie a base de dados do sistema:
     ```sql
     CREATE DATABASE IF NOT EXISTS sgfp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
   * Importe primeiro o arquivo estrutural `database/schema.sql` e depois o arquivo de dados `database/seed.sql` dentro da base de dados `sgfp_db`.

2. **Ajuste de Conectividade do Backend**:
   * No diretório `/backend`, verifique o ficheiro `.env`.
   * Se utilizar as credenciais padrão do WAMP, o utilizador costuma ser `root` e a palavra-passe fica em branco:
     ```ini
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_NAME=sgfp_db
     DB_USER=root
     DB_PASS=
     ```

3. **Configuração de Diretórios no WAMP**:
   * Pode mapear a pasta `/backend` do projeto no diretório `www` do WAMP como um VirtualHost para aceder via um subdomínio local, ou simplesmente iniciar o PHP embutido na porta `8000`.

---

### 💻 Cenário B: Inicialização Manual por Linha de Comandos

#### Passo 1 — Execução do MySQL local
Execute as diretivas SQL no seu terminal MySQL:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sgfp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p sgfp_db < database/schema.sql
mysql -u root -p sgfp_db < database/seed.sql
```

#### Passo 2 — Inicialização da API Backend (PHP)
```bash
# Entrar no diretório do backend
cd backend

# Iniciar o servidor local apontando para a pasta pública de entrada
php -S localhost:8000 -t public
```
A API estará em execução em **http://localhost:8000**.

#### Passo 3 — Instalação e Inicialização do Frontend (Angular)
```bash
# Entrar no diretório do frontend
cd frontend

# Instalar as dependências do ecossistema Node (apenas na primeira execução)
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```
O frontend estará acessível no navegador em **http://localhost:4200**.

---

## 🔑 Acesso de Demonstração (Demo)

| Perfil | Email | Password |
|:---|:---|:---|
| **Administrador** | `admin@sgfp.com` | `admin123` |
| **Utilizador Comum** | `demo@sgfp.com` | `demo123` |

---

## 📁 Estrutura Física do Projeto

```
├── database/
│   ├── schema.sql          # Estrutura física da DB (Tabelas, FKs, Chaves)
│   └── seed.sql            # Massa de dados inicial (Categorias, Utilizadores, Demo)
├── backend/
│   ├── .env                # Variáveis de ambiente da API (Conexão MySQL + Chave JWT)
│   ├── public/
│   │   └── index.php       # Front Controller e ponto único de entrada
│   └── app/
│       ├── Config/         # Configurações do sistema e conexão PDO
│       ├── Core/           # Estruturas do Router HTTP, Request e Response
│       ├── Middleware/     # Verificadores de Token JWT, CORS e Privilégios Admin
│       ├── Controllers/    # Lógica de processamento de endpoints REST
│       ├── Services/       # Validações financeiras e regras de negócio
│       ├── Repositories/   # Camada SQL isolada (Transações, Contas, Metas)
│       └── routes.php      # Mapeamento completo de rotas da API REST
├── frontend/
│   ├── public/
│   │   └── assets/
│   │       └── i18n/       # Dicionários de Tradução JSON dinâmicos (PT, EN, ES, FR...)
│   └── src/app/
│       ├── core/           # Interceptors, Guards e I18nService centralizado
│       ├── shared/         # Elementos globais do Shell (Navbar lateral e cabeçalhos)
│       └── features/       # Módulos específicos (Dashboard, Transações, Contas, Admin)
```

---

## 📈 Auditoria de Cálculos & Regras de Negócio

* **Saldo Consolidado**: Calculado rigorosamente no backend como `SOMA(Receitas) - SOMA(Despesas)` nas transações associadas.
* **Alerta de Estouro de Orçamento**: O frontend calcula a taxa de utilização atual de cada orçamento e exibe alertas visuais caso os gastos se aproximem ou excedam o limite estabelecido. Para fins estéticos premium, barras de progresso superiores a 100% são visualmente delimitadas na largura do contentor (`Math.min(percentual, 100)`), mas continuam exibindo o cálculo matemático exato de estouro (ex: `156.4% utilizado`).
* **Filtros e Relatórios**: Pesquisas e agrupamentos por data utilizam manipulações locais e tratamento seguro de timezones no frontend, evitando divergências na agregação por períodos mensais.

---

> [!NOTE]
> Este projeto foi desenvolvido inteiramente com fins académicos para consolidar princípios fundamentais de **Clean Code**, **Padrões de Desenho (Design Patterns)** e **Acessibilidade Responsiva** em aplicações ricas da internet (RIA).

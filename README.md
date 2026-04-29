# Sistema de ponto de venda - Lanchonete Fullstack

Um sistema Full-Stack completo de Frente de Caixa (PDV) e Painel Administrativo desenvolvido para lanchonetes. O projeto permite registrar vendas, gerenciar produtos (com exclusão lógica) e analisar o histórico de transações e relatórios de faturamento.

Back-end feito utilizando **Python com FastAPI**, Banco de dados com **PostgresSQL** e Front-end utilizando javascript **React**

Projeto feito inicialmente para a matéria de banco de dados de ciência da computação da UFPB.

## Tecnologias Utilizadas

### Front-end

- **React** (Vite / Create React App)
  
- **JavaScript (ES6+)** (e CSS inline)
  
- **`Fetch()`** (para chamada do Back-end)
  
- **LocalStorage** (Gerenciamento de sessão e persistência segura do Token JWT no navegador)

- Roteamento condicional de telas e controle de estados com Hooks (`useState`, `useEffect`)

### Back-end

- **Python 3.13**
  
- **FastAPI** (Criação da API RESTful)

- **uvicorn** (servidor web ASGI para requisições HTTP)
  
- **Pydantic** (Validação de dados e Schemas)
  
- **Psycopg2** (Driver de conexão com o banco de dados)
  
- **PyJWT & Passlib (Bcrypt)** (Autenticação via Token JWT e hash de senhas)
  
- **python-multipart** (Processador de dados de formulário 'form-data' para login)
  
- **python-dotenv** (Para leitura do arquivo .env)

### Banco de Dados
- **PostgreSQL** (Usado neon.tech como host do BD, mas qualquer BD PostgresSQL vai funcionar)

## Funcionalidades

- **Autenticação e Autorização:** Login via JWT com controle de acessos (Gerente ou Vendedor).

- **Frente de Caixa (PDV):** Busca de produtos, carrinho de compras e registro de vendas com opções de pagamento (Pix, Dinheiro, Crédito, Débito. Apenas para registro).

- **Gestão de Produtos:** Adicionar, editar e listar produtos. Produtos desativados vão para uma aba de "Inativos" (exclusão lógica) e podem ser reativados.

- **Histórico de Vendas:** Visualização detalhada de todas as vendas, itens comprados e forma de pagamento, com filtros por data.

- **Relatório Financeiro:** Relatório de arrecadação por produto e receita total do período, com filtro por data.

## Como rodar o projeto

### 1. Clone o repositório e entre na pasta:**
```bash
git clone https://github.com/Thiago-CRF/Projeto-banco-de-dados.git
cd Projeto-banco-de-dados
```

### 2. Preparação do Banco de Dados:
Instale PostgreSQL localmente, crie um banco de dados e pega a URL do banco. Ou utilize um host como o [Neon.tech](https://neon.tech) que utilizei e pegue a URL de conexão do banco de dados. 

Não é necessário criar as tabelas manualmente; o script `database.py` as cria automaticamente na primeira execução.

### 3. Configuração das variáveis de ambiente:
1. Crie uma chave 32 bytes para a encriptação rodando esse comando no terminal:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

2. Crie um arquivo `.env` baseado no `.env.example`:
```bash
URL_DATABASE=<link do banco de dados na nuvem ou local>
AUTH_KEY=<chave 32 bytes aleatoria criada com o comando "python -c "import secrets; print(secrets.token_hex(32))"">
ALGORITHM_JWT=<qualquer algoritimo suportado pelo PyJWT. Como HS256, RS256, ES256, HS512 etc.>
```
E coloque a URL do seu banco de dados após URL_DATABASE=

Coloque a chave 32 bytes criada com o código anterior após AUTH_KEY=

E coloque um algoritimo válido de sua escolha após ALGORITHM_JWT=, HS256 é um dos mais comumente usados.

Deixe tudo junto sem espaço sem espaço ao colocar os valores.

### 4. Configuração do Back-end:
**1. Crie e ative o ambiente virtual (.venv):**
- No Windows:
```bash
python3.13 -m venv .venv
```
E depois:
```bash
.venv\Scripts\activate
```

- No Linux ou Mac:
```bash
python3.13 -m venv .venv
```
E depois:
```bash
source .venv/bin/activate
```

**2. Instale as dependências, usando o `requirements.txt`:**
```bash
pip install -r api/requirements.txt
```

**3. Inicie o servidor:**
```bash
uvicorn main:app --reload
```

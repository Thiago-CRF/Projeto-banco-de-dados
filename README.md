# Sistema de ponto de venda - Lanchonete Fullstack

Um sistema completo de Frente de Caixa (PDV) e Painel Administrativo desenvolvido para lanchonetes. O projeto permite registrar vendas, gerenciar produtos (com exclusão lógica) e analisar o histórico de transações e relatórios de faturamento.

Projeto feito inicialmente para a matéria de banco de dados de ciência da computação da UFPB.

## Tecnologias Utilizadas

### Front-end

* **React** (Vite / Create React App)
  
- **JavaScript (ES6+)** (e CSS inline)
  
- **Fetch()** (para chamada do Back-end)
  
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

import psycopg2
from os import getenv
from dotenv import load_dotenv

# usando neon.tch como banco na nuvem, carregando url do .env
load_dotenv()

URL_DATABASE = getenv("URL_DATABASE")
if not URL_DATABASE:
    raise ValueError("O URL_DATABSE não foi encontrado no .env")

def criar_banco():
    try:
        # cria a conexão e cursor do banco com a biblioteca psycopg2 pra criar as tabelas do banco
        con = psycopg2.connect(URL_DATABASE)
        cur = con.cursor()
        print("Banco de dados criado")

        sql_prod_table = """
        CREATE TABLE IF NOT EXISTS produtos (
        id_prod SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT, 
        preco DECIMAL(5, 2) NOT NULL,
        qnt_vendida INTEGER DEFAULT 0
        );
        """

        # usa o timestamp do banco de dados pra registrar a hora da venda automaticamente
        sql_sell_table = """
        CREATE TABLE IF NOT EXISTS vendas (
        id_venda SERIAL PRIMARY KEY,
        data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valor_total DECIMAL(8, 2) NOT NULL
        );
        """

        sql_itens_venda_table = """
        CREATE TABLE IF NOT EXISTS itens_venda (
        id_item SERIAL PRIMARY KEY,
        id_venda INTEGER NOT NULL,
        id_produto INTEGER NOT NULL REFERENCES produtos(id_prod),
        quantidade INTEGER NOT NULL,
        preco_unid DECIMAL(5, 2) NOT NULL,

        FOREIGN KEY (id_venda) REFERENCES vendas(id_venda) ON DELETE CASCADE
        );
        """
        # on delete cascade é pra que quando alguma venda for deletada, os itens da venda também são deletados
        # deletadno tudo em cascata


        cur.execute(sql_prod_table)
        cur.execute(sql_sell_table)
        con.commit()

        cur.execute(sql_itens_venda_table)
        con.commit()

    except Exception as erro:
        print(f"Erro ao criar o banco de dados: {erro}")

    finally:
        #fecha a conexão no fim
        if "con" in locals() and con:
            cur.close()
            con.close()
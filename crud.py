import psycopg2
import database
from schemas import Produto


class Gerente:
    def __init__(self):
        # abre a conexão logo que a classe for criada
        self.con = psycopg2.connect(database.URL_DATABASE)
        self.cur = self.con.cursor()

    # criar métodos de gerenciamento da lanchonete:
    # 'inserir produto' pra criar um novo produto no banco
    def inserir_prod(self, produto: Produto):
        self.cur.execute("""
            INSERT INTO produtos(nome, descricao, preco, qnt_vendida)
            VALUES (%s, %s, %s, %s)""", (produto.nome, produto.desc, 
                                         produto.preco, produto.qnt_vendida)
        )
        self.con.commit()
        print(f"\n# Produto '{produto.nome}' cadastrado #")

        return produto.nome

    # 'atualizar produto' pra alterar o preço, nome ou descrição do produto
    # ao atualizar o produto chamando essa função, preciso que caso a pessoa não digite um novo
    # nome, ou descrição ou preço, seja enviado o nome, preço ou descrição antigas,
    # fazer isso na função que recebe a entrada do usuário (não pode ficar sem)
    def atualizar_prod(self, id_produto, produto: Produto):
        self.cur.execute("""
            UPDATE produtos SET preco = %s, nome = %s, descricao = %s
            WHERE id_prod = %s""", (produto.preco, produto.nome, produto.desc, id_produto)
            )
        self.con.commit()
        print(f"\n# Produto de id: {id_produto} atualizado #")

    # 'remover produto' pra remover completamente o produto do banco
    def remover_prod(self, id_produto):
        self.cur.execute("""
            DELETE FROM produtos WHERE id_prod = %s""", (id_produto,)
            )
        self.con.commit()
        print(f"\n# Produto de id: {id_produto} removido #")

    # 'listar todos' pra listas todos os produtos, com id, nome, descrição, preço
    def listar_todos(self):
        self.cur.execute("""
            SELECT * FROM produtos ORDER BY preco ASC"""
            )
        produtos = self.cur.fetchall()
        # retornando pra quando chamar essa função antes de modificar um produto
        # a função que chama tem a os dados atuais do produto a ser modificado
        # pra reenviar esses dados caso não modifica algum parametro do produto
        return produtos

    # 'pesquisar por nome' pra pesquisar e mostrar os produtos com nome correspondente
    def pesquisar_prod_por_nome(self, nome_pesquisa):
        self.cur.execute("""
            SELECT * FROM produtos  
            WHERE nome ILIKE %s""", (f"{nome_pesquisa}%",) 
            )       # presisa mandar a variavel nome como fstring pra colocar as %% em volta

        resultados = self.cur.fetchall()
        return resultados

    # 'gerar relatório' gera o relatório de vendas dos produtos, com quantidade vendida, 
    # valor vendido e valor total. De cada produto
    def relatorio_vendas(self):
    # fazer calculo dos valores com código SQL
        self.cur.execute("""
            SELECT nome, preco, qnt_vendida, (preco * qnt_vendida) AS valor_vendido 
            FROM produtos
            WHERE qnt_vendida > 0
            ORDER BY valor_vendido DESC
            """)
        
        relatorio = self.cur.fetchall()
        return relatorio

    # fecha cursor e conexão com o banco
    def fechar_conexao(self):
        self.cur.close()
        self.con.close()
    
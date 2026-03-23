import psycopg2
import database
from schemas import Produto, ProdutoVenda

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
            WHERE id_prod = %s
            RETURNING id_prod
            """, (produto.preco, produto.nome, produto.desc, id_produto)
            )
        res = self.cur.fetchone()[0]

        if res is None:
            raise ValueError(f"Produto de id: {id_produto} não encontrado para atualização")
        
        self.con.commit()

        return f"Produto de id: {res} atualizado"

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
    
class Vendedor:
    def __init__(self):
        # abre a conexão logo que a classe for criada
        self.con = psycopg2.connect(database.URL_DATABASE)
        self.cur = self.con.cursor()

    # criar venda
    # recebe o id dos produtos que vão ser vendidos e as quantidades (selecionados antes), calcula o valor total da venda
    # e registra na tabela vendas, registrando também a hora
    # depois com o id dos produtos, quantidades, id da venda(tabela vendas) e o preço unitario
    # vai ser preenchido a tabela itens_venda, pra cada produto
    def registrar_venda(self, lista_prod: list[ProdutoVenda]):
        # recebe lista de obejtos pydantic ProdutoVenda. atributos: id, qnt_venda

        # primeiro pega os valores do produtos recebidos, com o id e faz o calculo do valor total da compra
        ids_produtos = []
        for item in lista_prod:
            ids_produtos.append(item.id)

        self.cur.execute("""
            SELECT id_prod, preco
            FROM produtos
            WHERE id_prod IN %s""", (tuple(ids_produtos),) # typecast tuple pra não dar erro caso tenha só 1 id
        )

        resultado = self.cur.fetchall()
        dict_id_preco = {}
        for linha in resultado:
            dict_id_preco[linha[0]] = linha[1]

        # calculo do valor total da venda, passa comparando cada id ao dicionario e soma no valor total
        soma_valores = 0
        for i in lista_prod:
            # verifica se algum id recebido não existe no banco
            if i.id not in  dict_id_preco:
                raise ValueError(f"Produto de id '{i.id}' não encontrado no sistema")
            
            # depois faz o calculo da soma dos valores
            soma_valores += (i.qnt_venda * dict_id_preco[i.id])

        self.cur.execute("""
            INSERT INTO vendas (valor_total)
            VALUES (%s)
            RETURNING id_venda""", (soma_valores,)
        )
        # fetch sempre retorna uma tupla, mesmo fetchone. pegando só o primeiro item pra pegar o numero em si
        id_venda = self.cur.fetchone()[0]

        # depois pega o id da venda pra adicionar os produtos da venda (com a relação de tabelas)
        # e faz o insert dos produtos da venda com uma lista dos produtos e usando executemany 

        # preciso do id_venda, id_produto, quantidade, preco_unid
        # id_venda está em id_venda. id_produto e preco_unid esta no dicionario dict_id_preco
        # e quantidade esta em lista_prod, lista de obejetos pydantic com id e quantidade
        lista_insert = []
        for i in lista_prod:
            preco_unid = dict_id_preco[i.id]
            tupla_temp = (id_venda, i.id, i.qnt_venda, preco_unid)
            lista_insert.append(tupla_temp)

        # usa o execute many pra fazer usar a lista de insert que criei qntes
        self.cur.executemany("""
            INSERT INTO itens_venda (id_venda, id_produto, quantidade, preco_unid)
            VALUES (%s, %s, %s, %s)""", lista_insert
        )

        # atualiza a quantidade vendida no sistema, criando uma lista de tuplas qnt_vendida, id pra dar UPDATE na tabela produtos
        lista_update = []
        for i in lista_prod:
            tupla_temp = (i.qnt_venda, i.id)
            lista_update.append(tupla_temp)

        self.cur.executemany("""
            UPDATE produtos
            SET qnt_vendida = (qnt_vendida + %s)
            WHERE id_prod = %s""", lista_update
        )

        self.con.commit()

        return f"Venda de id: {id_venda} com valor total: R${soma_valores:.2f} registrada."


    def fechar_conexao(self):
        self.cur.close()
        self.con.close()
# uvicorn main:app --reload
import database
import crud
import schemas

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware

# cria o banco e inicia obj adm de gerente e a API
database.criar_banco()

app = FastAPI(title="API Lanchonete")

def get_gerente():
    adm = crud.Gerente()
    try:
        yield adm
    finally:
        adm.fechar_conexao()

def get_vendedor():
    vend = crud.Vendedor()
    try:
        yield vend
    finally:
        vend.fechar_conexao()

@app.get("/")
def home():
    """Rota publica de teste pra API"""
    return {"message": "API da lanchonete."}


# métodos de manipulação dos produtos (GERENTE)

# Inserir produto no banco 
@app.post("/produtos")  # TODO refazer esse método e a integração dele no crud pra verificar e dar exceptions em erros
def criar_produto(produto: schemas.ProdutoBase, adm: crud.Gerente = Depends(get_gerente)):
    # ATUALIZAR PRA PEGAR ERROS DE INSERÇÃO
    
    if produto.desc == "" or produto.desc == "string":
        produto.desc = None

    adm.inserir_prod(produto)

    return {"Retorno": f"Produto de nome '{produto.nome}' inserido no banco de dados"}

# Modifica os atributos de um produto do banco. Exceto a quantidade vendida.
@app.put("/produtos/{id_prod}")
def atualizar_produto(produto_att: schemas.ProdutoBase, id_prod: int, adm: crud.Gerente = Depends(get_gerente)):
    # front-end precisa enviar todos os atributos que vão estar na atualização, mesmo os que não vão ser modificados,
    # enviando os valores antigos caso o cliente não queira modificar
    try:
        return {"Retorno": adm.atualizar_prod(id_prod, produto_att)}
    # se o id pra atualização não for encontrado, pega o erro de id não encontrado na função atualizar_prod do crud
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))
    
@app.delete("/produtos/{id_prod}")
def delete_produto(id_prod: int, adm: crud.Gerente = Depends(get_gerente)):
    # envia o id do produto que quer deletar e retorna um no content pra mostrar que deletou
    try:
        return {"Retorno": adm.remover_prod(id_prod)}
    # se o id não for encontrado, pega o erro na função do banco do crud
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))


# métodos de manipulação das vendas / pesquisa (VENDEDOR E GERENTE)

# registra uma venda no banco de dados
@app.post("/venda")
def criar_venda(produtos_venda: list[schemas.ProdutoVenda], vend: crud.Vendedor = Depends(get_vendedor)):
    # envia uma lista de Objetos pydantic ProdutoVenda
    try:
        # registra a venda e retorna formato JSON pra facilitar no retorno da API
        return {"Retorno": vend.registrar_venda(produtos_venda)}

    except ValueError as err:
        # se acontecer de ter o ValueError do id enviado estar errado, vai pegar o erro e subir uma exceção HTTP mostrando a mensagem  
        raise HTTPException(status_code=404, detail=str(err))
    
# lista todos os produtos do banco
@app.get("/produtos", response_model=list[schemas.Produto])
def listar_produtos(adm: crud.Gerente = Depends(get_gerente)):
    
    produtos = adm.listar_todos()

    prod_formatados = []
    for i in produtos:
        prod_dict = {
            "id": i[0],
            "nome": i[1],
            "desc": i[2],
            "preco": i[3],
            "qnt_vendida": i[4]
        }
        prod_formatados.append(prod_dict)

    return prod_formatados

# pesquisa produtos por nome
@app.get("/produtos/pesuisa", response_model=list[schemas.Produto])
def pesquisa_por_nome(nome_pesquisa: str, vend: crud.Gerente = Depends(get_vendedor)):

    res_pesquisa = vend.pesquisar_prod_por_nome(nome_pesquisa)

    pesquisa_formatada = []
    for i in res_pesquisa:
        prod_dict = {
            "id": i[0],
            "nome": i[1],
            "desc": i[2],
            "preco": i[3],
            "qnt_vendida": i[4]
        }
        pesquisa_formatada.append(prod_dict)

    return pesquisa_formatada


# TODO:

# buscar dados de um só produto pelo id. detalhes_produto(id_prod). Fazer função no crud e o (GET /produtos/{id_prod}) no main pra API

# fazer o método do relatório de vendas dos produtos na API (GET /produtos/relatorio). Usando a função crud.relatorio_vendas()

# fazer um método que mostra o histórico de vendas, mostrando id, valor total, data/hora e itens(de forma simples). Fazer função no crud e o (GET /vendas) no main pra API
# filtrar o histórico de vendas por data, de: data_init, até: data_fim

# fazer um método que pega o relatório completo de uma só venda, como um recibo da venda, incluindo os dados completos da tabela itens_venda. 
# fazendo método (GET /vendas/{id_venda}) e função no crud detalhes_venda

# fazer as classes pydantic de venda. ItemVenda, VendaBase/Venda. (talvez RelatorioVenda)

# TODO 2. Depois fazer a parte de autenticação:

# fazer o login do usuário, sendo só vendedor ou gerente,
# fazendo tabela de usuários, com id, username, hash_senha, e acesso(sendo Gerente ou Vendedor. Ou 1 e 0 para acesso completo ou não)

# fazer a rota de login que o usuário envia username e senha e recebe o token. E tudo que for fazer precisa ser validado pelo token.

# fazer a separação de o que o vendedor não pode acessar que o gerente pode na prática (talvez seja mais no front-end)
# mas também verificar não só o token mas também o acesso da conta quando for as funções de gerente


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
@app.post("/produtos")
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

@app.get("/pesuisa", response_model=list[schemas.Produto])
def pesquisa_por_nome(nome_pesquisa: str, adm: crud.Gerente = Depends(get_gerente)):

    res_pesquisa = adm.pesquisar_prod_por_nome(nome_pesquisa)

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


# métodos de manipulação das vendas (VENDEDOR)

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
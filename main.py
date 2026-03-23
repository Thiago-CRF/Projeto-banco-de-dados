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
@app.post("/produtos")
def criar_produto(produto: schemas.ProdutoBase, adm: crud.Gerente = Depends(get_gerente)):
    
    if produto.desc == "" or produto.desc == "string":
        produto.desc = None

    adm.inserir_prod(produto)

    return {"mensagem": f"Produto de nome '{produto.nome}' inserido no banco de dados"}

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


# métodos de manipulação das vendas (VENDEDOR)
@app.post("/venda")
def criar_venda(produtos_venda: list[schemas.ProdutoVenda], vend: crud.Vendedor = Depends(get_vendedor)):
    # envia uma lista de Objetos pydantic ProdutoVenda
    try:
        # registra a venda e retorna formato JSON pra facilitar no retorno da API
        return {"Retorno": vend.registrar_venda(produtos_venda)}

    except ValueError as err:
        # se acontecer de ter o ValueError do id enviado estar errado, vai pegar o erro e subir uma exceção HTTP mostrando a mensagem  
        raise HTTPException(status_code=404, detail=str(err))
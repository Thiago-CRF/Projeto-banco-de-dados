# uvicorn main:app --reload
import database
import crud
import schemas
import auth

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware

import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError

# cria o banco e inicia obj adm de gerente e a API
database.criar_banco()

app = FastAPI(title="API Lanchonete")

# esquema de autenticação que diz ao fastAPI que o token pro login é na rota /login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def decode_token(token: str = Depends(oauth2_scheme)):
    # try pega o payload do token, decodifica e pega o username e cargo do payload do token
    # e para se o token for incompleto, expirado ou se for invalido
    try:
        payload = jwt.decode(token, auth.AUTH_KEY, algorithms=[auth.ALGORITHM])

        username: str = payload.get("sub")
        cargo: str = payload.get("cargo")

        if username is None or cargo is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Token incompleto ou invalido")

        return payload
    
    # pega o erro se o token expirou
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Seu login expirou. Entre novamente")

    # pega o erro se o token for invalido
    except InvalidTokenError as err:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail=f"Token invalido: {str(err)}")


def get_gerente(payload: dict = Depends(decode_token)):
    # pega o token que esta logado e ve se o cargo bate com gerente pra liberar acesso as funçoes de gerente
    if payload.get("cargo") != "gerente":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                            detail="Acesso negado. Ação exige acesso de gerente")

    adm = crud.Gerente()
    try:
        yield adm
    finally:
        adm.fechar_conexao()

# vendedor continua igual porque só tem gerente e vendedor. Então não precisa verificar se é vendedor quando chamar
def get_vendedor():
    vend = crud.Vendedor()
    try:
        yield vend
    finally:
        vend.fechar_conexao()

# conexão livre pra login
def get_con_livre():
    db = crud.Gerente()
    try:
        yield db
    finally:
        db.fechar_conexao()


@app.get("/")
def home():
    """Rota publica de teste pra API"""
    return {"message": "API da lanchonete."}


# métodos criar usuário (apenas gerente) e login
@app.post("/users", response_model=schemas.User)
def criar_usuario(usuario: schemas.CreateUser, adm: crud.Gerente = Depends(get_gerente)):

    if adm.verificar_username(usuario.username.lower()) != None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="E-mail já cadastrado")
    
    # hash da senha usando auth.py
    hash_senha = auth.get_hash_senha(usuario.senha)

    novo_usuario = schemas.CreateUser(username=usuario.username.lower(), 
                                      senha=hash_senha, 
                                      cargo=usuario.cargo.lower())

    usuario_criado = adm.criar_usuario(novo_usuario)

    return usuario_criado

# login de usuario
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: crud.Gerente = Depends(get_con_livre)):
    # busca o usuario no banco, pelo nome e pega o erro que tem no crud se o username não existri
    try:
        usuario_db = db.buscar_usuario(form_data.username.lower())
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(err))

    # verifica a senha, retornando true ou false, verify do passlib cryptcontext
    verificacao_senha = auth.verificar_senha(form_data.password, usuario_db["hash_senha"])

    if not verificacao_senha:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Senha de usuário incorreta")
    
    # cria o payload do token JWT e depois envia pro auth.criar_token_JWT pra fazer o encode do token
    dados_token = {
        "sub": usuario_db["username"],
        "cargo": usuario_db["cargo"]
    }

    token_acesso = auth.criar_token_JWT(dados=dados_token)

    # precisa retornar no formato do protocolo OAuth2
    return {"access_token": token_acesso, "token_type": "bearer"}


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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(err))
    
# exclui um produto do banco de dados
@app.delete("/produtos/{id_prod}")
def delete_produto(id_prod: int, adm: crud.Gerente = Depends(get_gerente)):
    # envia o id do produto que quer deletar e retorna um no content pra mostrar que deletou
    try:
        return {"Retorno": adm.remover_prod(id_prod)}
    # se o id não for encontrado, pega o erro na função do banco do crud
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(err))
    
# relatório de venda dos produtos (primeiro simples, depois filtra por data)
@app.get("/produtos/relatorio", response_model=list[schemas.RelatorioProduto])
def relatorio_vendas_produtos(adm: crud.Gerente = Depends(get_gerente)):

    relatorio = adm.relatorio_vendas()

    if relatorio == None:
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, detail=("Nenhuma produto com venda registrada"))
    else:
        relatorio_formatado = []
        for i in relatorio:
            relatorio_dict = {
                "id": i[0],
                "nome": i[1],
                "preco": i[2],
                "qnt_vendida": i[3],
                "valor_vendido": i[4]
            }
            relatorio_formatado.append(relatorio_dict)

        return relatorio_formatado


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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(err))
    
# lista todos os produtos do banco
@app.get("/produtos", response_model=list[schemas.Produto])
def listar_produtos(vend: crud.Vendedor = Depends(get_vendedor)):
    
    produtos = vend.listar_todos()

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
def pesquisa_por_nome(nome_pesquisa: str, vend: crud.Vendedor = Depends(get_vendedor)):

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

@app.get("/produtos/{id_prod}", response_model=schemas.Produto)
def detalhes_produto(id_prod: int, vend: crud.Vendedor = Depends(get_vendedor)):

    try:
        dados_produto = vend.mostrar_um_produto(id_prod)

    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(err))

    prod_formatado = {  # TRANSFORMAR FORMATAÇÃO EM UM FUNÇÃO
            "id": dados_produto[0],
            "nome": dados_produto[1],
            "desc": dados_produto[2],
            "preco": dados_produto[3],
            "qnt_vendida": dados_produto[4]
        }
    
    return prod_formatado

# histórico de vendas, começando na mais recente. Talvez deixar só pro ADM
@app.get("/venda/historico", response_model=list[schemas.HistoricoVenda])
def historico_de_vendas(vend: crud.Vendedor = Depends(get_vendedor)):

    try:
        historico_bruto = vend.historico_vendas()

    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(err))
    
    # separa por venda(id, data_hora, valor_total), e uma lista de todos os produtos da venda
    historico_formatado = {}
    for i in historico_bruto:
        id_venda = i[0]

        if id_venda not in historico_formatado:
            historico_formatado[id_venda] = {
                "id_venda": i[0],
                "data_hora": i[1],
                "valor_total": i[2],
                "itens": []
            }
        
        historico_formatado[id_venda]["itens"].append({
            "nome_prod": i[3],
            "preco_prod": i[4]
        })

    return list(historico_formatado.values())



# TODO:

# [FEITO] buscar dados de um só produto pelo id. detalhes_produto(id_prod). Fazer função no crud e o (GET /produtos/{id_prod}) no main pra API

# [FEITO] fazer o método do relatório de vendas dos produtos na API (GET /produtos/relatorio). Usando a função crud.relatorio_vendas()

# [FEITO] fazer um método que mostra o histórico de vendas, mostrando id, valor total, data/hora e itens(de forma simples). Fazer função no crud e o (GET /vendas) no main pra API
# filtrar o histórico de vendas por data, de: data_init, até: data_fim

# fazer um método que pega o relatório completo de uma só venda, como um recibo da venda, incluindo os dados completos da tabela itens_venda. 
# fazendo método (GET /vendas/{id_venda}) e função no crud detalhes_venda

# [MEIO FEITO] fazer as classes pydantic de venda. ItemVenda, VendaBase/Venda. (talvez RelatorioVenda)

# TODO 2. Depois fazer a parte de autenticação [FAZER ANTES DO FRONT-END E DE MELHORIAS PRÁTICAS]:

# fazer o login do usuário, sendo só vendedor ou gerente,
# fazendo tabela de usuários, com id, username, hash_senha, e acesso(sendo Gerente ou Vendedor. Ou 1 e 0 para acesso completo ou não)

# fazer a rota de login que o usuário envia username e senha e recebe o token. E tudo que for fazer precisa ser validado pelo token.

# fazer a separação de o que o vendedor não pode acessar que o gerente pode na prática (talvez seja mais no front-end)
# mas também verificar não só o token mas também o acesso da conta quando for as funções de gerente


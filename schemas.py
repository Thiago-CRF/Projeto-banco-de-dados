from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ProdutoBase(BaseModel):
    nome: str
    desc: Optional[str] = None
    preco: float
    qnt_vendida: int = 0

class ProdID(BaseModel):
    id: int

class Produto(ProdutoBase, ProdID):
    model_config = ConfigDict(from_attributes=True)

class ProdutoVenda(ProdID):
    qnt_venda: int

# venda
class RelatorioProduto(ProdID):
    nome: str
    preco: float
    qnt_vendida: int
    valor_vendido: float


class VendaBase(BaseModel):
    id_venda: int
    data_hora: datetime
    valor_total: float

# SELECT V.id_venda, V.data_hora, V.valor_total, P.nome, I.preco_unid
class HistoricoVenda(VendaBase): 
    itens: list

# schemas de usuarios
class UserBase(BaseModel):
    username: str
    cargo: str

class CreateUser(UserBase):
# criar usuário, envia a senha digitada
    senha: str
    
class User(UserBase):
# modelo de resposta, o que a API devolve quando pede os dados de um usuário especifico
    id_usuario: int

    model_config = ConfigDict(from_attributes=True)

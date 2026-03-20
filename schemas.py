from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class ProdutoBase(BaseModel):
    nome: str
    desc: Optional[str] = None
    preco: float
    qnt_vendida: int = 0

class ProdID(BaseModel):
    id: int

class Produto(ProdutoBase, ProdID):
    model_config = ConfigDict(from_attributes=True)
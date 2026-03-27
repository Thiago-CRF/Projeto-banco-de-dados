# autenticação de login e gerenciamento dos tokensJWT

from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt    # biblioteca pyjwt
from os import getenv
from dotenv import load_dotenv

# primerio carrega as variaveis do .env pra usar no encrypt
load_dotenv()

AUTH_KEY = getenv("AUTH_KEY")
if not AUTH_KEY:
    raise ValueError("A AUTH_KEY não foi encontrado no .env")

ALGORITHM = getenv("ALGORITHM_JWT")
if not ALGORITHM:
    raise ValueError("O ALGORITHM_JWT não foi encontrado no .env")

ACCESS_JWT_EXPIRE_HOURS = 15    # 15 horas pro tokenjwt do login expirar

# qual contexto de algoritimo vai usar pra criptografar. no caso o "bcrypt" 
pwd_context = CryptContext(schemes=["bcrypt"])

def get_senha_hash(senha: str):
    return pwd_context.hash(senha)

def verificar_senha(tentativa_senha: str, hash_bd: str):
    return pwd_context.verify(tentativa_senha, hash_bd)

def criar_token_JWT(dados: dict, delta_expiracao: timedelta=None):
    
    dado_bruto = dados.copy()

    if delta_expiracao:
        expiracao = datetime.now(timezone.utc) + delta_expiracao
    else:
        expiracao = datetime.now(timezone.utc) + timedelta(hours=ACCESS_JWT_EXPIRE_HOURS)

    dado_bruto.update({"exp": expiracao})

    encoded_JWT = jwt.encode(dado_bruto, AUTH_KEY, ALGORITHM)

    return encoded_JWT
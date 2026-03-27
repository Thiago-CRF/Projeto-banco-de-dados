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

# contexto de algoritimo que vai ser usado pra criptografar a senha no hash. nesse caso o "bcrypt"
# o cryptcontext do passlib aceita algoritimos de encriptação diferentes, mudando no schemes=
pwd_context = CryptContext(schemes=["bcrypt"])

# transforma a senha em um hash pra guardar no banco
def get_hash_senha(senha: str):
    return pwd_context.hash(senha)

# compara uma senha tentada com o hash guardado
def verificar_senha(tentativa_senha: str, hash_bd: str):
    return pwd_context.verify(tentativa_senha, hash_bd)

# cria o tokenJWT pro usuário usar o sistema
def criar_token_JWT(dados: dict, delta_expiracao: timedelta=None):
    
    dado_bruto = dados.copy()

    # se o token receber um timedelta diferente (pra se eu quiser uma função de mudar a senha no futuro)
    # ele pega o timedelta que recebe da chamada, se não usa as 15 horas definido em cima
    if delta_expiracao:
        expiracao = datetime.now(timezone.utc) + delta_expiracao
    else:
        expiracao = datetime.now(timezone.utc) + timedelta(hours=ACCESS_JWT_EXPIRE_HOURS)

    # coloca o dado de expiração no payload JSON que recebeu, que é como um dict python
    dado_bruto.update({"exp": expiracao})

    # depois pega os dados JSON e encoda tudo junto usando os dados do payload, cahve e algoritimo usado
    # pra criar o token em si
    encoded_JWT = jwt.encode(dado_bruto, AUTH_KEY, ALGORITHM)

    return encoded_JWT
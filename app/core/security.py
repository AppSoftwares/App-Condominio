import os
import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from fastapi import Security, HTTPException, Depends
from fastapi.security.api_key import APIKeyHeader
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from starlette.status import HTTP_401_UNAUTHORIZED
from app.core.database import get_session
from app.models.entities import ApiKey, Resident

SECRET_KEY = os.environ["SECRET_KEY"]
if len(SECRET_KEY) < 32:
    raise RuntimeError("SECRET_KEY debe tener al menos 32 caracteres de entropia")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 90

API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)
reusable_oauth2 = HTTPBearer()


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return f"pbkdf2_sha256$100000${base64.b64encode(salt).decode('utf-8')}${base64.b64encode(derived_key).decode('utf-8')}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    if not stored_hash:
        return False

    if stored_hash.startswith("pbkdf2_sha256$"):
        _, iterations_str, salt_b64, expected_b64 = stored_hash.split("$", 3)
        salt = base64.b64decode(salt_b64.encode("utf-8"))
        expected_hash = base64.b64decode(expected_b64.encode("utf-8"))
        derived_key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, int(iterations_str))
        return hmac.compare_digest(derived_key, expected_hash)

    return hmac.compare_digest(plain_password, stored_hash)


def verify_api_key(
    api_key: str = Security(API_KEY_HEADER),
    session: Session = Depends(get_session)
):
    if not api_key:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="API Key faltante")

    hashed_input = hashlib.sha256(api_key.encode()).hexdigest()
    statement = select(ApiKey).where(ApiKey.key_hash == hashed_input, ApiKey.activo == True)
    db_key = session.exec(statement).first()

    if not db_key:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="API Key inválida o inactiva")
    return db_key

def create_tokens(user_id: int):
    # Access Token
    access_expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = jwt.encode(
        {"sub": str(user_id), "exp": access_expire, "type": "access"},
        SECRET_KEY, algorithm=ALGORITHM
    )

    # Refresh Token (3 meses)
    refresh_expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = jwt.encode(
        {"sub": str(user_id), "exp": refresh_expire, "type": "refresh"},
        SECRET_KEY, algorithm=ALGORITHM
    )

    return access_token, refresh_token

def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(reusable_oauth2),
    session: Session = Depends(get_session)
) -> Resident:
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Tipo de token inválido")
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token sin identificación de usuario")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    user = session.get(Resident, int(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

def get_current_admin(current_user: Resident = Depends(get_current_user)) -> Resident:
    if current_user.rol != "admin":
        raise HTTPException(status_code=403, detail="No tienes permisos de administrador para esta acción")
    return current_user

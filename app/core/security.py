import os
import hashlib
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

SECRET_KEY = os.getenv("SECRET_KEY", "cambiame_por_una_llave_segura_en_produccion")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 90

API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)
reusable_oauth2 = HTTPBearer()

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

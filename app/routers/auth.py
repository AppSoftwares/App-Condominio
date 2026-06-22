from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.security import create_tokens
from app.models.entities import Resident
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    password: str # En producción usaríamos hashing (bcrypt)

@router.post("/login")
def login(data: LoginRequest, session: Session = Depends(get_session)):
    statement = select(Resident).where(Resident.email == data.email)
    user = session.exec(statement).first()

    # Simulación de validación de password (en real usar verify_password)
    if not user or user.password_hash != data.password:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    access, refresh = create_tokens(user.id)

    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "nombre": user.nombre,
            "rol": user.rol,
            "email": user.email
        }
    }

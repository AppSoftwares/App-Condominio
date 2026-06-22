from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import hashlib
import secrets
from app.core.database import get_session
from app.core.security import get_current_admin
from app.models.entities import ApiKey, Resident
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/admin/security", tags=["Admin Security"])

class ApiKeyCreate(BaseModel):
    nombre_cliente: str
    permisos: List[str] = []

class ApiKeyResponse(BaseModel):
    id: int
    nombre_cliente: str
    activo: bool
    # No devolvemos el hash, solo el ID y nombre

@router.post("/keys")
def create_new_api_key(
    data: ApiKeyCreate,
    admin: Resident = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    """Genera una nueva API Key para integraciones externas (n8n)"""
    # 1. Generar la key aleatoria (esto es lo que se le muestra al usuario UNA VEZ)
    raw_key = f"condo_{secrets.token_urlsafe(32)}"

    # 2. Hashear para guardar en DB
    hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()

    new_key = ApiKey(
        nombre_cliente=data.nombre_cliente,
        key_hash=hashed_key,
        permisos=data.permisos,
        activo=True
    )
    session.add(new_key)
    session.commit()
    session.refresh(new_key)

    return {
        "id": new_key.id,
        "nombre_cliente": new_key.nombre_cliente,
        "api_key_viva": raw_key,
        "mensaje": "COPIA ESTA CLAVE AHORA. No podrás volver a verla."
    }

@router.get("/keys", response_model=List[ApiKeyResponse])
def list_api_keys(
    admin: Resident = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    return session.exec(select(ApiKey)).all()

@router.delete("/keys/{key_id}")
def revoke_api_key(
    key_id: int,
    admin: Resident = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    key = session.get(ApiKey, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="API Key no encontrada")

    key.activo = False
    session.add(key)
    session.commit()
    return {"message": "API Key revocada exitosamente"}

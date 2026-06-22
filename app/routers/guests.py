from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from datetime import datetime
import secrets
from app.core.database import get_session
from app.core.security import get_current_user
from app.models.entities import GuestAccess, Resident
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/guests", tags=["Guests"])

class GuestCreate(BaseModel):
    nombre_invitado: str
    identificacion: Optional[str] = None
    fecha_visita: datetime

@router.post("/")
def create_guest_access(data: GuestCreate, current_user: Resident = Depends(get_current_user), session: Session = Depends(get_session)):
    # Generar un token único para el QR
    token = secrets.token_urlsafe(16)

    new_guest = GuestAccess(
        residente_id=current_user.id,
        nombre_invitado=data.nombre_invitado,
        identificacion=data.identificacion,
        fecha_visita=data.fecha_visita,
        token_qr=token
    )
    session.add(new_guest)
    session.commit()
    session.refresh(new_guest)
    return new_guest

@router.get("/my-guests", response_model=List[GuestAccess])
def get_my_guests(current_user: Resident = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(GuestAccess).where(GuestAccess.residente_id == current_user.id)
    return session.exec(statement).all()

# Endpoint para el Vigilante (Confirmar Ingreso)
@router.post("/confirm-entry/{token_qr}")
def confirm_guest_entry(token_qr: str, session: Session = Depends(get_session)):
    statement = select(GuestAccess).where(GuestAccess.token_qr == token_qr)
    guest = session.exec(statement).first()

    if not guest:
        raise HTTPException(status_code=404, detail="Código QR inválido")

    if guest.ingreso_confirmado:
        return {"message": "Este invitado ya ingresó anteriormente", "fecha": guest.fecha_ingreso_efectiva}

    guest.ingreso_confirmado = True
    guest.fecha_ingreso_efectiva = datetime.utcnow()
    session.add(guest)
    session.commit()
    return {"message": "Ingreso registrado correctamente", "invitado": guest.nombre_invitado}

@router.get("/logbook", response_model=List[GuestAccess])
def get_logbook(session: Session = Depends(get_session)):
    """Libro de novedades para el vigilante"""
    return session.exec(select(GuestAccess).order_by(GuestAccess.fecha_ingreso_efectiva.desc())).all()

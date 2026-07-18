from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select
from typing import List
from datetime import datetime
from app.core.database import get_session
from app.core.security import get_current_user
from app.core.limiter import limiter
from app.models.entities import Reservation, Amenity, Resident, Announcement
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/reservations", tags=["Reservations"])

class ReservationCreate(BaseModel):
    amenity_id: int
    fecha_hora: datetime
    duracion_horas: int = 2

@router.post("/")
@limiter.limit("5/minute")
def create_reservation(request: Request, data: ReservationCreate, current_user: Resident = Depends(get_current_user), session: Session = Depends(get_session)):
    amenity = session.get(Amenity, data.amenity_id)
    if not amenity:
        raise HTTPException(status_code=404, detail="Area común no encontrada")

    # Crear la reserva
    new_res = Reservation(
        amenity_id=data.amenity_id,
        residente_id=current_user.id,
        fecha_hora=data.fecha_hora,
        duracion_horas=data.duracion_horas
    )
    session.add(new_res)

    # Publicar en el mural (Anuncio automático)
    mural_msg = f"El residente {current_user.nombre} ha reservado el área: {amenity.nombre} para el {data.fecha_hora.strftime('%d/%m/%Y %H:%M')}."
    anuncio = Announcement(
        titulo=f"Reserva: {amenity.nombre}",
        mensaje=mural_msg,
        tipo="reserva",
        fecha_expiracion=data.fecha_hora
    )
    session.add(anuncio)

    session.commit()
    session.refresh(new_res)
    return new_res

@router.get("/", response_model=List[Reservation])
def list_reservations(session: Session = Depends(get_session)):
    return session.exec(select(Reservation)).all()

@router.get("/amenities", response_model=List[Amenity])
def list_amenities(session: Session = Depends(get_session)):
    return session.exec(select(Amenity)).all()

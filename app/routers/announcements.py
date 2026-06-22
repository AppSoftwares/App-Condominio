from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from typing import Optional, List
from app.core.database import get_session
from app.models.entities import Announcement
from app.services.notification_service import send_push_to_section
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/announcements", tags=["Announcements"])

class AnnouncementCreate(BaseModel):
    titulo: str
    mensaje: str
    tipo: str
    seccion_id: Optional[int] = None

@router.post("/")
def create_announcement(data: AnnouncementCreate, session: Session = Depends(get_session)):
    new_announcement = Announcement.model_validate(data)
    session.add(new_announcement)
    session.commit()
    session.refresh(new_announcement)

    # Push notification
    send_push_to_section(session, data.seccion_id, data.titulo, data.mensaje)

    return new_announcement

@router.get("/")
def list_announcements(seccion_id: Optional[int] = Query(None), session: Session = Depends(get_session)):
    statement = select(Announcement)
    if seccion_id:
        statement = statement.where(Announcement.seccion_id == seccion_id)
    return session.exec(statement).all()

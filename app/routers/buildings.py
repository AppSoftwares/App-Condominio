from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.database import get_session
from app.core.security import verify_api_key
from app.models.entities import Building, Section, Unit
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/v1/buildings", tags=["Buildings"])

class BuildingCreate(BaseModel):
    nombre: str
    direccion: str
    cantidad_pisos: int
    cantidad_torres: int
    cantidad_apartamentos: int

@router.post("/", dependencies=[Depends(verify_api_key)])
def create_building(data: BuildingCreate, session: Session = Depends(get_session)):
    db_building = Building.model_validate(data)
    session.add(db_building)
    session.commit()
    session.refresh(db_building)
    return db_building

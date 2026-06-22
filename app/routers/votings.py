from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from typing import List
from datetime import datetime
from app.core.database import get_session
from app.core.security import get_current_user, get_current_admin
from app.models.entities import Voting, VoteRecord, Resident
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/votings", tags=["Votings"])

class VotingCreate(BaseModel):
    titulo: str
    descripcion: str
    fecha_fin: datetime
    monto_propuesto: Optional[float] = None

@router.post("/")
def create_voting(data: VotingCreate, admin: Resident = Depends(get_current_admin), session: Session = Depends(get_session)):
    new_voting = Voting.model_validate(data)
    session.add(new_voting)
    session.commit()
    session.refresh(new_voting)
    return new_voting

@router.get("/", response_model=List[Voting])
def list_votings(session: Session = Depends(get_session)):
    return session.exec(select(Voting).where(Voting.activa == True)).all()

@router.post("/{voting_id}/vote")
def cast_vote(voting_id: int, opcion: str, current_user: Resident = Depends(get_current_user), session: Session = Depends(get_session)):
    if opcion not in ["favor", "contra"]:
        raise HTTPException(status_code=400, detail="Opción de voto inválida")

    voting = session.get(Voting, voting_id)
    if not voting or not voting.activa:
        raise HTTPException(status_code=404, detail="Votación no encontrada o cerrada")

    # Verificar si ya votó
    statement = select(VoteRecord).where(VoteRecord.voting_id == voting_id, VoteRecord.residente_id == current_user.id)
    existing_vote = session.exec(statement).first()
    if existing_vote:
        raise HTTPException(status_code=400, detail="Ya has emitido tu voto para esta propuesta")

    new_vote = VoteRecord(voting_id=voting_id, residente_id=current_user.id, opcion=opcion)
    session.add(new_vote)
    session.commit()

    return {"message": "Voto registrado correctamente"}

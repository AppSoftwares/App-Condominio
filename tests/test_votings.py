import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlalchemy.pool import StaticPool
from app.main import app
from app.core.database import get_session
from app.models.entities import Voting, Resident, VoteRecord
from app.core.security import get_current_user

# In-memory database for testing
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    # Mock current user
    user = Resident(id=1, nombre="Test User", email="test@test.com", password_hash="...", telefono="...", unidad_id=1, rol="propietario")
    session.add(user)
    session.commit()

    app.dependency_overrides[get_current_user] = lambda: user

    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def test_cast_vote_success(client: TestClient, session: Session):
    # Setup
    voting = Voting(titulo="Propuesta", descripcion="Desc", fecha_fin=datetime.utcnow() + timedelta(days=1), activa=True)
    session.add(voting)
    session.commit()

    # Execute
    response = client.post(f"/api/v1/votings/{voting.id}/vote?opcion=favor")

    # Verify
    assert response.status_code == 200
    assert response.json()["message"] == "Voto registrado correctamente"

    vote = session.exec(select(VoteRecord)).first()
    assert vote.opcion == "favor"

def test_cast_vote_duplicate(client: TestClient, session: Session):
    # Setup
    voting = Voting(titulo="Propuesta", descripcion="Desc", fecha_fin=datetime.utcnow() + timedelta(days=1), activa=True)
    session.add(voting)
    session.commit()

    # First vote
    client.post(f"/api/v1/votings/{voting.id}/vote?opcion=favor")

    # Second vote
    response = client.post(f"/api/v1/votings/{voting.id}/vote?opcion=contra")

    # Verify
    assert response.status_code == 400
    assert "Ya has emitido tu voto" in response.json()["detail"]

def test_cast_vote_invalid_option(client: TestClient, session: Session):
    # Setup
    voting = Voting(titulo="Propuesta", descripcion="Desc", fecha_fin=datetime.utcnow() + timedelta(days=1), activa=True)
    session.add(voting)
    session.commit()

    # Execute
    response = client.post(f"/api/v1/votings/{voting.id}/vote?opcion=talvez")

    # Verify
    assert response.status_code == 400
    assert "Opcion de voto invalida" in response.json()["detail"]

def test_cast_vote_closed_voting(client: TestClient, session: Session):
    # Setup
    voting = Voting(titulo="Propuesta", descripcion="Desc", fecha_fin=datetime.utcnow() + timedelta(days=1), activa=False)
    session.add(voting)
    session.commit()

    # Execute
    response = client.post(f"/api/v1/votings/{voting.id}/vote?opcion=favor")

    # Verify
    assert response.status_code == 404
    assert "Votacion no encontrada o cerrada" in response.json()["detail"]

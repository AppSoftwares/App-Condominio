from sqlmodel import create_engine, Session, SQLModel
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database.db")

engine_kwargs = {"echo": True}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

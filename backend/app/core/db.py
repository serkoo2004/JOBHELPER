from pathlib import Path

from sqlmodel import SQLModel, Session, create_engine

from backend.app.core.config import settings

DB_FILE = Path(__file__).resolve().parents[2] / "career_copilot.db"
DATABASE_URL = settings.database_url or f"sqlite:///{DB_FILE}"
ENGINE = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)


def create_db_and_tables() -> None:
    if DATABASE_URL.startswith("sqlite"):
        DB_FILE.parent.mkdir(parents=True, exist_ok=True)
    SQLModel.metadata.create_all(ENGINE)


def get_session() -> Session:
    return Session(ENGINE)

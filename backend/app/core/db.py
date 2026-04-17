from pathlib import Path

from sqlalchemy import inspect, text
from sqlmodel import SQLModel, Session, create_engine

from backend.app.core.config import settings
from backend.app.models import (
    AiMessageModel,
    AiSessionModel,
    AuditLogModel,
    DocumentFlowModel,
    JobApplicationModel,
    ProfileModel,
    ResumeModel,
    ResumeVersionModel,
)

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
    _ensure_profile_columns()


def _ensure_profile_columns() -> None:
    inspector = inspect(ENGINE)
    if "profilemodel" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("profilemodel")}
    required_columns = {
        "experiences": "TEXT",
        "projects": "TEXT",
        "education": "TEXT",
        "photo_url": "TEXT",
    }
    with ENGINE.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name in columns:
                continue
            connection.execute(text(f"ALTER TABLE profilemodel ADD COLUMN {column_name} {column_type}"))


def get_session() -> Session:
    return Session(ENGINE)

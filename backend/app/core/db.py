from pathlib import Path

from sqlalchemy import inspect, text
from sqlalchemy.exc import OperationalError
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
LOCAL_SQLITE_URL = f"sqlite:///{DB_FILE}"


def _build_engine(database_url: str):
    return create_engine(
        database_url,
        echo=False,
        connect_args={"check_same_thread": False} if database_url.startswith("sqlite") else {},
        pool_pre_ping=not database_url.startswith("sqlite"),
    )


DATABASE_URL = settings.database_url or LOCAL_SQLITE_URL
ACTIVE_DATABASE_URL = DATABASE_URL
ENGINE = _build_engine(ACTIVE_DATABASE_URL)


def _switch_to_sqlite_fallback() -> None:
    global ENGINE, ACTIVE_DATABASE_URL
    ACTIVE_DATABASE_URL = LOCAL_SQLITE_URL
    ENGINE = _build_engine(ACTIVE_DATABASE_URL)


def create_db_and_tables() -> None:
    try:
        if ACTIVE_DATABASE_URL.startswith("sqlite"):
            DB_FILE.parent.mkdir(parents=True, exist_ok=True)
        SQLModel.metadata.create_all(ENGINE)
        _ensure_profile_columns()
    except OperationalError:
        if settings.db_fallback_to_sqlite_on_error and not ACTIVE_DATABASE_URL.startswith("sqlite"):
            DB_FILE.parent.mkdir(parents=True, exist_ok=True)
            _switch_to_sqlite_fallback()
            SQLModel.metadata.create_all(ENGINE)
            _ensure_profile_columns()
            return
        raise


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

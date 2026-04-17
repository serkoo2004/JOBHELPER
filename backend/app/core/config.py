import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parents[3]
load_dotenv(ROOT_DIR / ".env")
load_dotenv(ROOT_DIR / ".env.example", override=False)


def _get_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _get_list(name: str, default: list[str]) -> list[str]:
    value = os.getenv(name)
    if not value:
        return default
    return [item.strip() for item in value.split(",") if item.strip()]


def _normalize_database_url(value: str | None) -> str | None:
    if not value:
        return None
    normalized = value.strip()
    if normalized.startswith("postgresql://"):
        return normalized.replace("postgresql://", "postgresql+psycopg://", 1)
    if normalized.startswith("postgres://"):
        return normalized.replace("postgres://", "postgresql+psycopg://", 1)
    return normalized


@dataclass(slots=True)
class Settings:
    project_name: str = field(default_factory=lambda: os.getenv("PROJECT_NAME", "Career Copilot"))
    debug: bool = field(default_factory=lambda: _get_bool("DEBUG", True))
    api_version: str = field(default_factory=lambda: os.getenv("API_VERSION", "v1"))
    default_locale: str = field(default_factory=lambda: os.getenv("DEFAULT_LOCALE", "tr-TR"))
    allow_origins: list[str] = field(default_factory=lambda: _get_list("ALLOW_ORIGINS", ["*"]))
    allow_credentials: bool = field(default_factory=lambda: _get_bool("ALLOW_CREDENTIALS", False))
    database_url: str | None = field(default_factory=lambda: _normalize_database_url(os.getenv("DATABASE_URL")))
    rate_limit_enabled: bool = field(default_factory=lambda: _get_bool("RATE_LIMIT_ENABLED", True))
    rate_limit_max_requests: int = field(default_factory=lambda: int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "120")))
    rate_limit_window_seconds: int = field(default_factory=lambda: int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60")))
    admin_api_key: str | None = field(default_factory=lambda: os.getenv("ADMIN_API_KEY"))

    google_api_key: str | None = field(default_factory=lambda: os.getenv("GOOGLE_API_KEY"))
    google_model: str = field(default_factory=lambda: os.getenv("GOOGLE_MODEL", "gemini-2.5-flash"))
    openai_api_key: str | None = field(default_factory=lambda: os.getenv("OPENAI_API_KEY"))
    openai_model: str = field(default_factory=lambda: os.getenv("OPENAI_MODEL", "gpt-4o-mini"))

    google_client_id: str | None = field(default_factory=lambda: os.getenv("GOOGLE_CLIENT_ID"))
    google_client_secret: str | None = field(default_factory=lambda: os.getenv("GOOGLE_CLIENT_SECRET"))
    google_redirect_uri: str | None = field(default_factory=lambda: os.getenv("GOOGLE_REDIRECT_URI"))

    apple_client_id: str | None = field(default_factory=lambda: os.getenv("APPLE_CLIENT_ID"))
    apple_team_id: str | None = field(default_factory=lambda: os.getenv("APPLE_TEAM_ID"))
    apple_key_id: str | None = field(default_factory=lambda: os.getenv("APPLE_KEY_ID"))
    apple_private_key: str | None = field(default_factory=lambda: os.getenv("APPLE_PRIVATE_KEY"))
    apple_redirect_uri: str | None = field(default_factory=lambda: os.getenv("APPLE_REDIRECT_URI"))


settings = Settings()

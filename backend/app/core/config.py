import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parents[3]
load_dotenv(ROOT_DIR / ".env")


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


@dataclass(slots=True)
class Settings:
    project_name: str = field(default_factory=lambda: os.getenv("PROJECT_NAME", "Career Copilot"))
    debug: bool = field(default_factory=lambda: _get_bool("DEBUG", True))
    api_version: str = field(default_factory=lambda: os.getenv("API_VERSION", "v1"))
    default_locale: str = field(default_factory=lambda: os.getenv("DEFAULT_LOCALE", "tr-TR"))
    allow_origins: list[str] = field(default_factory=lambda: _get_list("ALLOW_ORIGINS", ["*"]))
    database_url: str | None = field(default_factory=lambda: os.getenv("DATABASE_URL"))

    google_api_key: str | None = field(default_factory=lambda: os.getenv("GOOGLE_API_KEY"))
    google_model: str = field(default_factory=lambda: os.getenv("GOOGLE_MODEL", "text-bison-001"))
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

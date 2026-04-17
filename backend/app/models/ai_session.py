from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlmodel import Field, SQLModel


class AiSessionModel(SQLModel, table=True):
    session_id: str = Field(default_factory=lambda: uuid4().hex, primary_key=True, index=True)
    user_id: Optional[str] = Field(default=None, index=True)
    mode: str = "career_coach"
    title: Optional[str] = None
    context_json: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AiMessageModel(SQLModel, table=True):
    message_id: str = Field(default_factory=lambda: uuid4().hex, primary_key=True, index=True)
    session_id: str = Field(index=True)
    role: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

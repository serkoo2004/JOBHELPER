from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AiSessionCreateRequest(BaseModel):
    user_id: Optional[str] = None
    mode: str = "career_coach"
    title: Optional[str] = None
    context: dict[str, str] | None = None


class AiSessionMessageRequest(BaseModel):
    role: str
    content: str = Field(min_length=1)


class AiMessageResponse(BaseModel):
    message_id: str
    session_id: str
    role: str
    content: str
    created_at: datetime


class AiSessionResponse(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    mode: str
    title: Optional[str] = None
    context: dict[str, str] | None = None
    created_at: datetime
    updated_at: datetime
    messages: list[AiMessageResponse] = Field(default_factory=list)

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlmodel import Field, SQLModel


class AuditLogModel(SQLModel, table=True):
    log_id: str = Field(default_factory=lambda: uuid4().hex, primary_key=True, index=True)
    request_id: str = Field(index=True)
    method: str
    path: str
    status_code: int
    client_ip: Optional[str] = None
    user_agent: Optional[str] = None
    duration_ms: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    log_id: str
    request_id: str
    method: str
    path: str
    status_code: int
    client_ip: Optional[str] = None
    user_agent: Optional[str] = None
    duration_ms: int
    created_at: datetime

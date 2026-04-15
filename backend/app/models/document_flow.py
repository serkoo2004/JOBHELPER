from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class DocumentFlowModel(SQLModel, table=True):
    id: str = Field(primary_key=True, index=True)
    intent: str
    profile_id: Optional[str] = None
    context: Optional[str] = None
    base_profile: Optional[str] = None
    steps: Optional[str] = None
    step_index: int = 0
    answers: Optional[str] = None
    generated_draft_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

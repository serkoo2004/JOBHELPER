from datetime import date, datetime
from typing import Optional
from uuid import uuid4

from sqlmodel import Field, SQLModel


class JobApplicationModel(SQLModel, table=True):
    application_id: str = Field(default_factory=lambda: uuid4().hex, primary_key=True, index=True)
    user_id: Optional[str] = None
    company_name: str
    role_name: str
    source: Optional[str] = None
    job_url: Optional[str] = None
    applied_at: Optional[date] = None
    status: str = "pending"
    interview_date: Optional[date] = None
    notes: Optional[str] = None
    next_action: Optional[str] = None
    next_action_date: Optional[date] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

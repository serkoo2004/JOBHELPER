from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlmodel import Field, SQLModel


class ResumeModel(SQLModel, table=True):
    resume_id: str = Field(default_factory=lambda: uuid4().hex, primary_key=True, index=True)
    profile_id: Optional[str] = Field(default=None, index=True)
    title: str
    template: Optional[str] = None
    latest_version: int = 0
    status: str = "draft"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ResumeVersionModel(SQLModel, table=True):
    version_id: str = Field(default_factory=lambda: uuid4().hex, primary_key=True, index=True)
    resume_id: str = Field(index=True)
    version_number: int
    title: str
    summary: Optional[str] = None
    content: str
    template: Optional[str] = None
    template_reason: Optional[str] = None
    recommendations_json: Optional[str] = None
    profile_warnings_json: Optional[str] = None
    pdf_path: Optional[str] = None
    docx_path: Optional[str] = None
    status: str = "finalized"
    created_at: datetime = Field(default_factory=datetime.utcnow)

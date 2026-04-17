from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field
from backend.app.schemas.profile import UserProfileCreate


class ResumeAnalyzeRequest(BaseModel):
    content: str
    target_role: Optional[str] = None


class ResumeGenerateRequest(BaseModel):
    profile: UserProfileCreate
    template: Optional[str] = "smart"
    tone: Optional[str] = "professional"
    target_role: Optional[str] = None
    generation_context: dict[str, str] | None = None


class ResumeResponse(BaseModel):
    title: str
    summary: str
    content: str
    recommendations: list[str] = Field(default_factory=list)
    template: Optional[str] = None
    template_reason: Optional[str] = None


class ResumePreviewResponse(BaseModel):
    preview_id: str
    preview_url: str
    title: str


class ResumeTemplateOption(BaseModel):
    key: str
    name: str
    description: str
    layout_hint: str


class ResumeDraftCreateRequest(ResumeGenerateRequest):
    profile_warnings: list[str] = Field(default_factory=list)


class ResumeAutoDraftRequest(BaseModel):
    profile_id: str
    template: Optional[str] = "smart"
    tone: Optional[str] = "professional"
    target_role: Optional[str] = None
    generation_context: dict[str, str] | None = None
    auto_professionalize_photo: bool = True


class ResumeAutoFileRequest(ResumeAutoDraftRequest):
    format: Literal["pdf", "docx"]


class ResumeDraftUpdateRequest(BaseModel):
    title: str | None = None
    summary: str | None = None
    content: str | None = None
    template: str | None = None


class ResumeDraftResponse(BaseModel):
    draft_id: str
    resume_id: str | None = None
    version_number: int | None = None
    title: str
    summary: str
    content: str
    recommendations: list[str] = Field(default_factory=list)
    profile_warnings: list[str] = Field(default_factory=list)
    template: str | None = None
    template_reason: str | None = None
    finalized: bool = False
    preview_url: str | None = None


class ResumeExportRequest(BaseModel):
    format: Literal["pdf", "docx"]


class ResumeFileGenerateRequest(ResumeGenerateRequest):
    format: Literal["pdf", "docx"]


class ResumeStoredSummaryResponse(BaseModel):
    resume_id: str
    profile_id: str | None = None
    title: str
    template: str | None = None
    latest_version: int
    status: str
    created_at: datetime
    updated_at: datetime


class ResumeVersionResponse(BaseModel):
    version_id: str
    resume_id: str
    version_number: int
    title: str
    summary: str | None = None
    content: str
    template: str | None = None
    template_reason: str | None = None
    recommendations: list[str] = Field(default_factory=list)
    profile_warnings: list[str] = Field(default_factory=list)
    pdf_url: str | None = None
    docx_url: str | None = None
    status: str
    created_at: datetime

from typing import Optional

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


class ResumeResponse(BaseModel):
    title: str
    summary: str
    content: str
    recommendations: list[str] = Field(default_factory=list)
    template: Optional[str] = None

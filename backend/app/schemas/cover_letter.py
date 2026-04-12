from typing import Optional

from pydantic import BaseModel, Field
from backend.app.schemas.profile import UserProfileCreate


class CoverLetterRequest(BaseModel):
    profile: UserProfileCreate
    company_name: str
    position: str
    tone: Optional[str] = "professional"
    job_description: Optional[str] = None


class CoverLetterResponse(BaseModel):
    title: str
    summary: str
    content: str
    recommendations: list[str] = Field(default_factory=list)

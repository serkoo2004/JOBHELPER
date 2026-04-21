from typing import Optional

from pydantic import BaseModel, Field, model_validator
from backend.app.schemas.profile import UserProfileCreate


class CoverLetterRequest(BaseModel):
    profile: UserProfileCreate
    company_name: str
    position: Optional[str] = None
    job_title: Optional[str] = None
    tone: Optional[str] = "professional"
    job_description: Optional[str] = None

    @model_validator(mode="after")
    def validate_position(self) -> "CoverLetterRequest":
        if not (self.position or self.job_title):
            raise ValueError("Either 'position' or 'job_title' must be provided.")
        if not self.position and self.job_title:
            self.position = self.job_title
        return self


class CoverLetterResponse(BaseModel):
    title: str
    summary: str
    content: str
    recommendations: list[str] = Field(default_factory=list)

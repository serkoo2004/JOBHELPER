from typing import Optional

from pydantic import BaseModel, Field

from backend.app.schemas.profile import UserProfileCreate


class CareerToolResponse(BaseModel):
    title: str
    summary: str
    content: str
    recommendations: list[str] = Field(default_factory=list)


class JobMatchRequest(BaseModel):
    profile: UserProfileCreate
    job_description: str
    company_name: Optional[str] = None
    target_role: Optional[str] = None


class LinkedInOptimizeRequest(BaseModel):
    profile: UserProfileCreate
    target_role: Optional[str] = None
    tone: Optional[str] = "professional"


class PortfolioSummaryRequest(BaseModel):
    profile: UserProfileCreate
    focus: Optional[str] = None
    target_audience: Optional[str] = None


class InterviewPrepRequest(BaseModel):
    profile: UserProfileCreate
    company_name: Optional[str] = None
    target_role: Optional[str] = None
    job_description: Optional[str] = None


class CareerRoadmapRequest(BaseModel):
    profile: UserProfileCreate
    target_role: Optional[str] = None
    target_country: Optional[str] = None
    timeline_months: Optional[int] = 3


class PhotoAssistantRequest(BaseModel):
    profile: UserProfileCreate
    photo_path: Optional[str] = None
    template: Optional[str] = None
    style: Optional[str] = "professional dark background"
    desired_output: Optional[str] = "black_white_cv_headshot"
    existing_photo_notes: Optional[str] = None

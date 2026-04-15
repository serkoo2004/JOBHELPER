from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class ExperienceItem(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    current: bool = False
    bullets: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)


class ProjectItem(BaseModel):
    name: str
    subtitle: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    bullets: List[str] = Field(default_factory=list)
    link: Optional[str] = None


class EducationItem(BaseModel):
    degree: str
    school: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    details: List[str] = Field(default_factory=list)


class CertificationItem(BaseModel):
    name: str
    issuer: Optional[str] = None
    year: Optional[str] = None


class UserProfileCreate(BaseModel):
    user_id: Optional[str] = None
    full_name: str
    email: EmailStr
    photo_url: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    target_role: Optional[str] = None
    seniority_level: Optional[str] = None
    years_of_experience: Optional[int] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    certifications: List[str | CertificationItem] | None = None
    experiences: List[ExperienceItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)


class UserProfile(UserProfileCreate):
    user_id: str


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    photo_url: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    target_role: Optional[str] = None
    seniority_level: Optional[str] = None
    years_of_experience: Optional[int] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    certifications: List[str | CertificationItem] | None = None
    experiences: Optional[List[ExperienceItem]] = None
    projects: Optional[List[ProjectItem]] = None
    education: Optional[List[EducationItem]] = None

from typing import List, Optional
from pydantic import BaseModel, EmailStr


class UserProfileCreate(BaseModel):
    user_id: Optional[str] = None
    full_name: str
    email: EmailStr
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
    certifications: Optional[List[str]] = None


class UserProfile(UserProfileCreate):
    user_id: str

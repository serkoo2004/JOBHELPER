from datetime import date
from typing import Optional
from pydantic import BaseModel


class JobApplicationBase(BaseModel):
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


class JobApplicationCreate(JobApplicationBase):
    pass


class JobApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    next_action: Optional[str] = None
    next_action_date: Optional[date] = None
    interview_date: Optional[date] = None


class JobApplication(JobApplicationBase):
    application_id: str

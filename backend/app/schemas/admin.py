from datetime import datetime

from pydantic import BaseModel


class AdminOverviewResponse(BaseModel):
    profiles: int
    resumes: int
    resume_versions: int
    applications: int
    ai_sessions: int
    ai_messages: int
    audit_logs: int


class AdminSystemHealthResponse(BaseModel):
    database_backend: str
    admin_guard_enabled: bool
    rate_limit_enabled: bool
    rate_limit_max_requests: int
    rate_limit_window_seconds: int
    google_ai_configured: bool
    openai_ai_configured: bool
    requests_last_24h: int
    errors_last_24h: int


class AdminApplicationStatusItem(BaseModel):
    status: str
    count: int


class AdminRecentProfileItem(BaseModel):
    user_id: str
    full_name: str
    email: str
    target_role: str | None = None
    created_at: datetime


class AdminRecentResumeItem(BaseModel):
    resume_id: str
    version_number: int
    title: str
    template: str | None = None
    status: str
    created_at: datetime


class AdminRecentApplicationItem(BaseModel):
    application_id: str
    company_name: str
    role_name: str
    status: str
    source: str | None = None
    created_at: datetime


class AdminRecentAuditItem(BaseModel):
    log_id: str
    request_id: str
    method: str
    path: str
    status_code: int
    duration_ms: int
    client_ip: str | None = None
    created_at: datetime


class AdminDashboardResponse(BaseModel):
    overview: AdminOverviewResponse
    system: AdminSystemHealthResponse
    application_statuses: list[AdminApplicationStatusItem]
    recent_profiles: list[AdminRecentProfileItem]
    recent_resume_versions: list[AdminRecentResumeItem]
    recent_applications: list[AdminRecentApplicationItem]
    recent_audit_logs: list[AdminRecentAuditItem]

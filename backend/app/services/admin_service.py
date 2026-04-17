from datetime import datetime, timedelta

from sqlalchemy import func
from sqlmodel import select

from backend.app.core.config import settings
from backend.app.core.db import get_session
from backend.app.models.ai_session import AiMessageModel, AiSessionModel
from backend.app.models.application import JobApplicationModel
from backend.app.models.audit_log import AuditLogModel
from backend.app.models.profile import ProfileModel
from backend.app.models.resume import ResumeModel, ResumeVersionModel
from backend.app.schemas.admin import (
    AdminApplicationStatusItem,
    AdminDashboardResponse,
    AdminOverviewResponse,
    AdminRecentApplicationItem,
    AdminRecentAuditItem,
    AdminRecentProfileItem,
    AdminRecentResumeItem,
    AdminSystemHealthResponse,
)


class AdminService:
    @staticmethod
    def _build_overview(session) -> AdminOverviewResponse:
        profiles = session.exec(select(func.count()).select_from(ProfileModel)).one()
        resumes = session.exec(select(func.count()).select_from(ResumeModel)).one()
        resume_versions = session.exec(select(func.count()).select_from(ResumeVersionModel)).one()
        applications = session.exec(select(func.count()).select_from(JobApplicationModel)).one()
        ai_sessions = session.exec(select(func.count()).select_from(AiSessionModel)).one()
        ai_messages = session.exec(select(func.count()).select_from(AiMessageModel)).one()
        audit_logs = session.exec(select(func.count()).select_from(AuditLogModel)).one()
        return AdminOverviewResponse(
            profiles=int(profiles or 0),
            resumes=int(resumes or 0),
            resume_versions=int(resume_versions or 0),
            applications=int(applications or 0),
            ai_sessions=int(ai_sessions or 0),
            ai_messages=int(ai_messages or 0),
            audit_logs=int(audit_logs or 0),
        )

    @staticmethod
    def get_overview() -> AdminOverviewResponse:
        with get_session() as session:
            return AdminService._build_overview(session)

    @staticmethod
    def get_dashboard() -> AdminDashboardResponse:
        with get_session() as session:
            overview = AdminService._build_overview(session)
            last_24h = datetime.utcnow() - timedelta(hours=24)

            requests_last_24h = session.exec(
                select(func.count()).select_from(AuditLogModel).where(AuditLogModel.created_at >= last_24h)
            ).one()
            errors_last_24h = session.exec(
                select(func.count())
                .select_from(AuditLogModel)
                .where(AuditLogModel.created_at >= last_24h)
                .where(AuditLogModel.status_code >= 400)
            ).one()

            recent_profiles_raw = session.exec(
                select(ProfileModel).order_by(ProfileModel.created_at.desc()).limit(6)
            ).all()
            recent_versions_raw = session.exec(
                select(ResumeVersionModel).order_by(ResumeVersionModel.created_at.desc()).limit(6)
            ).all()
            recent_applications_raw = session.exec(
                select(JobApplicationModel).order_by(JobApplicationModel.created_at.desc()).limit(6)
            ).all()
            recent_audit_logs_raw = session.exec(
                select(AuditLogModel).order_by(AuditLogModel.created_at.desc()).limit(12)
            ).all()

            application_status_rows = session.exec(
                select(JobApplicationModel.status, func.count())
                .group_by(JobApplicationModel.status)
                .order_by(func.count().desc())
            ).all()

            database_backend = "unknown"
            if settings.database_url:
                if settings.database_url.startswith("postgresql+psycopg://"):
                    database_backend = "postgresql"
                elif settings.database_url.startswith("sqlite"):
                    database_backend = "sqlite"

            return AdminDashboardResponse(
                overview=overview,
                system=AdminSystemHealthResponse(
                    database_backend=database_backend,
                    admin_guard_enabled=bool(settings.admin_api_key),
                    rate_limit_enabled=settings.rate_limit_enabled,
                    rate_limit_max_requests=settings.rate_limit_max_requests,
                    rate_limit_window_seconds=settings.rate_limit_window_seconds,
                    google_ai_configured=bool(settings.google_api_key),
                    openai_ai_configured=bool(settings.openai_api_key),
                    requests_last_24h=int(requests_last_24h or 0),
                    errors_last_24h=int(errors_last_24h or 0),
                ),
                application_statuses=[
                    AdminApplicationStatusItem(status=status or "unknown", count=int(count or 0))
                    for status, count in application_status_rows
                ],
                recent_profiles=[
                    AdminRecentProfileItem(
                        user_id=item.id,
                        full_name=item.full_name,
                        email=item.email,
                        target_role=item.target_role,
                        created_at=item.created_at,
                    )
                    for item in recent_profiles_raw
                ],
                recent_resume_versions=[
                    AdminRecentResumeItem(
                        resume_id=item.resume_id,
                        version_number=item.version_number,
                        title=item.title,
                        template=item.template,
                        status=item.status,
                        created_at=item.created_at,
                    )
                    for item in recent_versions_raw
                ],
                recent_applications=[
                    AdminRecentApplicationItem(
                        application_id=item.application_id,
                        company_name=item.company_name,
                        role_name=item.role_name,
                        status=item.status,
                        source=item.source,
                        created_at=item.created_at,
                    )
                    for item in recent_applications_raw
                ],
                recent_audit_logs=[
                    AdminRecentAuditItem(
                        log_id=item.log_id,
                        request_id=item.request_id,
                        method=item.method,
                        path=item.path,
                        status_code=item.status_code,
                        duration_ms=item.duration_ms,
                        client_ip=item.client_ip,
                        created_at=item.created_at,
                    )
                    for item in recent_audit_logs_raw
                ],
            )

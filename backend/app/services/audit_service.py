from sqlmodel import desc, select

from backend.app.core.db import get_session
from backend.app.models.audit_log import AuditLogModel
from backend.app.schemas.audit import AuditLogResponse


class AuditService:
    @staticmethod
    def log_request(
        request_id: str,
        method: str,
        path: str,
        status_code: int,
        client_ip: str | None,
        user_agent: str | None,
        duration_ms: int,
    ) -> None:
        with get_session() as session:
            row = AuditLogModel(
                request_id=request_id,
                method=method,
                path=path,
                status_code=status_code,
                client_ip=client_ip,
                user_agent=user_agent,
                duration_ms=duration_ms,
            )
            session.add(row)
            session.commit()

    @staticmethod
    def list_logs(limit: int = 100) -> list[AuditLogResponse]:
        with get_session() as session:
            rows = session.exec(
                select(AuditLogModel)
                .order_by(desc(AuditLogModel.created_at))
                .limit(limit)
            ).all()
            return [
                AuditLogResponse(
                    log_id=row.log_id,
                    request_id=row.request_id,
                    method=row.method,
                    path=row.path,
                    status_code=row.status_code,
                    client_ip=row.client_ip,
                    user_agent=row.user_agent,
                    duration_ms=row.duration_ms,
                    created_at=row.created_at,
                )
                for row in rows
            ]

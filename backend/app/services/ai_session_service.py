import json
from datetime import datetime

from sqlmodel import select

from backend.app.core.db import get_session
from backend.app.models.ai_session import AiMessageModel, AiSessionModel
from backend.app.schemas.ai_session import (
    AiMessageResponse,
    AiSessionCreateRequest,
    AiSessionMessageRequest,
    AiSessionResponse,
)


class AiSessionService:
    @staticmethod
    def create_session(payload: AiSessionCreateRequest) -> AiSessionResponse:
        with get_session() as session:
            row = AiSessionModel(
                user_id=payload.user_id,
                mode=payload.mode,
                title=payload.title,
                context_json=json.dumps(payload.context, ensure_ascii=False) if payload.context else None,
            )
            session.add(row)
            session.commit()
            session.refresh(row)
            return AiSessionResponse(
                session_id=row.session_id,
                user_id=row.user_id,
                mode=row.mode,
                title=row.title,
                context=payload.context,
                created_at=row.created_at,
                updated_at=row.updated_at,
                messages=[],
            )

    @staticmethod
    def add_message(session_id: str, payload: AiSessionMessageRequest) -> AiMessageResponse | None:
        with get_session() as session:
            parent = session.get(AiSessionModel, session_id)
            if not parent:
                return None
            message = AiMessageModel(
                session_id=session_id,
                role=payload.role,
                content=payload.content,
            )
            parent.updated_at = datetime.utcnow()
            session.add(parent)
            session.add(message)
            session.commit()
            session.refresh(message)
            return AiMessageResponse(
                message_id=message.message_id,
                session_id=message.session_id,
                role=message.role,
                content=message.content,
                created_at=message.created_at,
            )

    @staticmethod
    def get_session(session_id: str) -> AiSessionResponse | None:
        with get_session() as session:
            row = session.get(AiSessionModel, session_id)
            if not row:
                return None
            messages = session.exec(
                select(AiMessageModel)
                .where(AiMessageModel.session_id == session_id)
                .order_by(AiMessageModel.created_at)
            ).all()
            context = json.loads(row.context_json) if row.context_json else None
            return AiSessionResponse(
                session_id=row.session_id,
                user_id=row.user_id,
                mode=row.mode,
                title=row.title,
                context=context,
                created_at=row.created_at,
                updated_at=row.updated_at,
                messages=[
                    AiMessageResponse(
                        message_id=message.message_id,
                        session_id=message.session_id,
                        role=message.role,
                        content=message.content,
                        created_at=message.created_at,
                    )
                    for message in messages
                ],
            )

    @staticmethod
    def list_user_sessions(user_id: str) -> list[AiSessionResponse]:
        with get_session() as session:
            rows = session.exec(
                select(AiSessionModel)
                .where(AiSessionModel.user_id == user_id)
                .order_by(AiSessionModel.updated_at.desc())
            ).all()
            results: list[AiSessionResponse] = []
            for row in rows:
                context = json.loads(row.context_json) if row.context_json else None
                results.append(
                    AiSessionResponse(
                        session_id=row.session_id,
                        user_id=row.user_id,
                        mode=row.mode,
                        title=row.title,
                        context=context,
                        created_at=row.created_at,
                        updated_at=row.updated_at,
                        messages=[],
                    )
                )
            return results

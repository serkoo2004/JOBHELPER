from datetime import datetime
from sqlmodel import select
from backend.app.schemas.tracker import JobApplication, JobApplicationCreate, JobApplicationUpdate
from backend.app.core.db import get_session
from backend.app.models.application import JobApplicationModel


class JobTrackerService:
    @staticmethod
    def create_application(payload: JobApplicationCreate) -> JobApplication:
        application_data = payload.model_dump()
        application_data["created_at"] = datetime.utcnow()
        application_data["updated_at"] = datetime.utcnow()
        with get_session() as session:
            application = JobApplicationModel(**application_data)
            session.add(application)
            session.commit()
            session.refresh(application)
            return JobApplication(**application.model_dump())

    @staticmethod
    def get_application(application_id: str) -> JobApplication | None:
        with get_session() as session:
            application = session.get(JobApplicationModel, application_id)
            if not application:
                return None
            return JobApplication(**application.model_dump())

    @staticmethod
    def list_applications() -> list[JobApplication]:
        with get_session() as session:
            results = session.exec(select(JobApplicationModel)).all()
            return [JobApplication(**item.model_dump()) for item in results]

    @staticmethod
    def update_application(application_id: str, payload: JobApplicationUpdate) -> JobApplication | None:
        with get_session() as session:
            application = session.get(JobApplicationModel, application_id)
            if not application:
                return None
            update_data = payload.model_dump(exclude_none=True)
            for key, value in update_data.items():
                setattr(application, key, value)
            application.updated_at = datetime.utcnow()
            session.add(application)
            session.commit()
            session.refresh(application)
            return JobApplication(**application.model_dump())

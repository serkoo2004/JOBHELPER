from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse, HTMLResponse
from backend.app.core.admin import require_admin
from backend.app.schemas.admin import AdminDashboardResponse, AdminOverviewResponse
from backend.app.schemas.ai_session import (
    AiMessageResponse,
    AiSessionCreateRequest,
    AiSessionMessageRequest,
    AiSessionResponse,
)
from backend.app.schemas.audit import AuditLogResponse
from backend.app.schemas.auth import LoginRequest, LoginResponse
from backend.app.schemas.profile import UserProfile, UserProfileCreate, UserProfileUpdate
from backend.app.schemas.resume import (
    ResumeAnalyzeRequest,
    ResumeAutoDraftRequest,
    ResumeAutoFileRequest,
    ResumeDraftCreateRequest,
    ResumeDraftResponse,
    ResumeDraftUpdateRequest,
    ResumeExportRequest,
    ResumeFileGenerateRequest,
    ResumeGenerateRequest,
    ResumePreviewResponse,
    ResumeResponse,
    ResumeStoredSummaryResponse,
    ResumeTemplateOption,
    ResumeVersionResponse,
)
from backend.app.schemas.cover_letter import CoverLetterRequest, CoverLetterResponse
from backend.app.schemas.career_tools import (
    CareerRoadmapRequest,
    CareerToolResponse,
    InterviewPrepRequest,
    JobMatchRequest,
    LinkedInOptimizeRequest,
    PhotoAssistantRequest,
    PortfolioSummaryRequest,
)
from backend.app.schemas.tracker import JobApplicationCreate, JobApplication, JobApplicationUpdate
from backend.app.schemas.media import MediaItem, PhotoStudioRequest, PhotoStudioResponse
from backend.app.schemas.document_flow import (
    DocumentFlowAnswerRequest,
    DocumentFlowResponse,
    DocumentFlowStartRequest,
)
from backend.app.services.ai_session_service import AiSessionService
from backend.app.services.admin_service import AdminService
from backend.app.services.audit_service import AuditService
from backend.app.services.auth_service import AuthService
from backend.app.services.career_service import CareerService
from backend.app.services.cover_letter_service import CoverLetterService
from backend.app.services.document_flow_service import DocumentFlowService
from backend.app.services.job_tracker_service import JobTrackerService
from backend.app.services.media_service import MediaService
from backend.app.services.profile_service import ProfileService
from backend.app.services.resume_service import ResumeService

api_router = APIRouter()

@api_router.get("/health", tags=["system"], summary="Health check")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "Career Copilot API"}


@api_router.get("/system/audit-logs", response_model=list[AuditLogResponse], tags=["admin"], summary="List recent audit logs")
def list_audit_logs(limit: int = Query(default=100, ge=1, le=500), _: None = Depends(require_admin)) -> list[AuditLogResponse]:
    return AuditService.list_logs(limit)


@api_router.get("/admin/overview", response_model=AdminOverviewResponse, tags=["admin"], summary="Get admin overview metrics")
def get_admin_overview(_: None = Depends(require_admin)) -> AdminOverviewResponse:
    return AdminService.get_overview()


@api_router.get("/admin/dashboard", response_model=AdminDashboardResponse, tags=["admin"], summary="Get admin dashboard data")
def get_admin_dashboard(_: None = Depends(require_admin)) -> AdminDashboardResponse:
    return AdminService.get_dashboard()

@api_router.post("/auth/login", response_model=LoginResponse, tags=["auth"], summary="Create login token")
def login(payload: LoginRequest) -> LoginResponse:
    token = AuthService.login(payload.email)
    return LoginResponse(access_token=token, token_type="bearer")


@api_router.post("/ai/sessions", response_model=AiSessionResponse, tags=["auth"], summary="Create AI conversation session")
def create_ai_session(payload: AiSessionCreateRequest) -> AiSessionResponse:
    return AiSessionService.create_session(payload)


@api_router.get("/ai/sessions/{session_id}", response_model=AiSessionResponse, tags=["auth"], summary="Get AI conversation session")
def get_ai_session(session_id: str) -> AiSessionResponse:
    session = AiSessionService.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="AI session not found")
    return session


@api_router.get("/ai/users/{user_id}/sessions", response_model=list[AiSessionResponse], tags=["auth"], summary="List AI sessions for a user")
def list_ai_sessions(user_id: str) -> list[AiSessionResponse]:
    return AiSessionService.list_user_sessions(user_id)


@api_router.post("/ai/sessions/{session_id}/messages", response_model=AiMessageResponse, tags=["auth"], summary="Add message to AI session")
def add_ai_session_message(session_id: str, payload: AiSessionMessageRequest) -> AiMessageResponse:
    message = AiSessionService.add_message(session_id, payload)
    if not message:
        raise HTTPException(status_code=404, detail="AI session not found")
    return message

@api_router.post("/profiles", response_model=UserProfile, tags=["profiles"], summary="Create profile")
def create_profile(payload: UserProfileCreate) -> UserProfile:
    return ProfileService.create_profile(payload)

@api_router.get("/profiles/{user_id}", response_model=UserProfile, tags=["profiles"], summary="Get profile")
def get_profile(user_id: str) -> UserProfile:
    profile = ProfileService.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@api_router.patch("/profiles/{user_id}", response_model=UserProfile, tags=["profiles"], summary="Update profile")
def update_profile(user_id: str, payload: UserProfileUpdate) -> UserProfile:
    profile = ProfileService.update_profile(user_id, payload)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@api_router.post("/resumes/analyze", response_model=ResumeResponse, tags=["resume-tools"], summary="Analyze CV text")
def analyze_resume(payload: ResumeAnalyzeRequest) -> ResumeResponse:
    return ResumeService.analyze_resume(payload)


@api_router.post("/resumes/analyze-upload", response_model=ResumeResponse, tags=["resume-tools"], summary="Upload and analyze CV file")
async def analyze_resume_upload(file: UploadFile = File(...), target_role: str | None = Form(None)) -> ResumeResponse:
    try:
        content_bytes = await file.read()
        return ResumeService.analyze_uploaded_resume(file.filename or "resume.txt", content_bytes, target_role)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

@api_router.post("/resumes/generate", response_model=ResumeResponse, tags=["resume-tools"], summary="Generate CV content")
def generate_resume(payload: ResumeGenerateRequest) -> ResumeResponse:
    return ResumeService.generate_resume(payload)


@api_router.get("/resumes/templates", response_model=list[ResumeTemplateOption], tags=["resume-tools"], summary="List CV templates")
def get_resume_templates() -> list[ResumeTemplateOption]:
    return ResumeService.list_templates()


@api_router.post("/resumes/generate-file", tags=["resume-tools"], summary="Generate and download CV file")
def generate_resume_file(payload: ResumeFileGenerateRequest) -> FileResponse:
    export_path = ResumeService.generate_file(payload)
    media_type = (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        if payload.format == "docx"
        else "application/pdf"
    )
    return FileResponse(
        path=export_path,
        media_type=media_type,
        filename=export_path.name,
    )


@api_router.post("/resumes/preview", response_model=ResumePreviewResponse, include_in_schema=False)
def create_resume_preview(payload: ResumeGenerateRequest) -> ResumePreviewResponse:
    return ResumeService.create_preview(payload)


@api_router.get("/resumes/preview/{preview_id}", response_class=HTMLResponse, include_in_schema=False)
def get_resume_preview(preview_id: str) -> HTMLResponse:
    html = ResumeService.get_preview_html(preview_id)
    if html is None:
        raise HTTPException(status_code=404, detail="Resume preview not found")
    return HTMLResponse(content=html)


@api_router.post("/resumes/drafts", response_model=ResumeDraftResponse, tags=["resume-drafts"], summary="Create CV draft")
def create_resume_draft(payload: ResumeDraftCreateRequest) -> ResumeDraftResponse:
    return ResumeService.create_draft(payload)


@api_router.post("/resumes/auto-draft", response_model=ResumeDraftResponse, tags=["resume-drafts"], summary="Create CV draft directly from stored profile")
def create_auto_resume_draft(payload: ResumeAutoDraftRequest) -> ResumeDraftResponse:
    draft = ResumeService.create_auto_draft(payload)
    if draft is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return draft


@api_router.post("/resumes/auto-generate-file", tags=["resume-drafts"], summary="Generate and download CV file directly from stored profile")
def generate_auto_resume_file(payload: ResumeAutoFileRequest) -> FileResponse:
    export_path = ResumeService.generate_auto_file(payload)
    if export_path is None:
        raise HTTPException(status_code=404, detail="Profile not found")

    media_type = (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        if payload.format == "docx"
        else "application/pdf"
    )
    return FileResponse(
        path=export_path,
        media_type=media_type,
        filename=export_path.name,
    )


@api_router.get("/resumes/drafts/{draft_id}", response_model=ResumeDraftResponse, tags=["resume-drafts"], summary="Get CV draft")
def get_resume_draft(draft_id: str) -> ResumeDraftResponse:
    draft = ResumeService.get_draft(draft_id)
    if draft is None:
        raise HTTPException(status_code=404, detail="Resume draft not found")
    return draft


@api_router.patch("/resumes/drafts/{draft_id}", response_model=ResumeDraftResponse, tags=["resume-drafts"], summary="Update CV draft")
def update_resume_draft(draft_id: str, payload: ResumeDraftUpdateRequest) -> ResumeDraftResponse:
    draft = ResumeService.update_draft(draft_id, payload)
    if draft is None:
        raise HTTPException(status_code=404, detail="Resume draft not found")
    return draft


@api_router.post("/resumes/drafts/{draft_id}/finalize", response_model=ResumeDraftResponse, tags=["resume-drafts"], summary="Finalize CV draft")
def finalize_resume_draft(draft_id: str) -> ResumeDraftResponse:
    draft = ResumeService.finalize_draft(draft_id)
    if draft is None:
        raise HTTPException(status_code=404, detail="Resume draft not found")
    return draft


@api_router.get("/resumes/drafts/{draft_id}/preview", response_class=HTMLResponse, include_in_schema=False)
def get_resume_draft_preview(draft_id: str) -> HTMLResponse:
    html = ResumeService.get_draft_preview_html(draft_id)
    if html is None:
        raise HTTPException(status_code=404, detail="Resume draft preview not found")
    return HTMLResponse(content=html)


@api_router.post("/resumes/drafts/{draft_id}/export", tags=["resume-drafts"], summary="Export finalized CV draft")
def export_resume_draft(draft_id: str, payload: ResumeExportRequest) -> FileResponse:
    draft = ResumeService.get_draft(draft_id)
    if draft is None:
        raise HTTPException(status_code=404, detail="Resume draft not found")
    if not draft.finalized:
        raise HTTPException(status_code=400, detail="Resume draft must be finalized before export")

    export_path = ResumeService.export_draft(draft_id, payload)
    if export_path is None:
        raise HTTPException(status_code=404, detail="Resume draft not found")

    media_type = (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        if payload.format == "docx"
        else "application/pdf"
    )
    return FileResponse(
        path=export_path,
        media_type=media_type,
        filename=export_path.name,
    )


@api_router.get("/resumes/profile/{profile_id}", response_model=list[ResumeStoredSummaryResponse], tags=["resume-drafts"], summary="List saved resumes for a profile")
def list_saved_resumes(profile_id: str) -> list[ResumeStoredSummaryResponse]:
    return ResumeService.list_saved_resumes(profile_id)


@api_router.get("/resumes/{resume_id}/versions", response_model=list[ResumeVersionResponse], tags=["resume-drafts"], summary="List saved resume versions")
def list_resume_versions(resume_id: str) -> list[ResumeVersionResponse]:
    return ResumeService.list_resume_versions(resume_id)


@api_router.post("/resumes/{resume_id}/versions/{version_number}/restore", response_model=ResumeDraftResponse, tags=["resume-drafts"], summary="Restore a saved resume version into a draft")
def restore_resume_version(resume_id: str, version_number: int) -> ResumeDraftResponse:
    draft = ResumeService.restore_resume_version(resume_id, version_number)
    if draft is None:
        raise HTTPException(status_code=404, detail="Resume version not found")
    return draft

@api_router.post("/cover-letters/generate", response_model=CoverLetterResponse, tags=["cover-letters"], summary="Generate cover letter")
def generate_cover_letter(payload: CoverLetterRequest) -> CoverLetterResponse:
    return CoverLetterService.generate_cover_letter(payload)


@api_router.post("/career/job-match", response_model=CareerToolResponse, tags=["career-tools"], summary="Match profile to job description")
def match_job(payload: JobMatchRequest) -> CareerToolResponse:
    return CareerService.match_job(payload)


@api_router.post("/career/linkedin-optimize", response_model=CareerToolResponse, tags=["career-tools"], summary="Optimize LinkedIn profile copy")
def optimize_linkedin(payload: LinkedInOptimizeRequest) -> CareerToolResponse:
    return CareerService.optimize_linkedin(payload)


@api_router.post("/career/portfolio-summary", response_model=CareerToolResponse, tags=["career-tools"], summary="Build portfolio/project summary")
def build_portfolio_summary(payload: PortfolioSummaryRequest) -> CareerToolResponse:
    return CareerService.build_portfolio(payload)


@api_router.post("/career/interview-prep", response_model=CareerToolResponse, tags=["career-tools"], summary="Prepare interview notes")
def prepare_interview(payload: InterviewPrepRequest) -> CareerToolResponse:
    return CareerService.prepare_interview(payload)


@api_router.post("/career/roadmap", response_model=CareerToolResponse, tags=["career-tools"], summary="Generate career roadmap")
def build_career_roadmap(payload: CareerRoadmapRequest) -> CareerToolResponse:
    return CareerService.build_career_roadmap(payload)


@api_router.post("/career/photo-assistant", response_model=CareerToolResponse, tags=["career-tools"], summary="Guide profile photo generation and placement")
def assist_profile_photo(payload: PhotoAssistantRequest) -> CareerToolResponse:
    return CareerService.assist_photo(payload)

@api_router.post("/applications", response_model=JobApplication, tags=["applications"], summary="Create application")
def create_application(payload: JobApplicationCreate) -> JobApplication:
    return JobTrackerService.create_application(payload)

@api_router.get("/applications", response_model=list[JobApplication], tags=["applications"], summary="List applications")
def list_applications() -> list[JobApplication]:
    return JobTrackerService.list_applications()

@api_router.get("/applications/{application_id}", response_model=JobApplication, tags=["applications"], summary="Get application")
def get_application(application_id: str) -> JobApplication:
    application = JobTrackerService.get_application(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Job application not found")
    return application

@api_router.patch("/applications/{application_id}", response_model=JobApplication, tags=["applications"], summary="Update application")
def update_application(application_id: str, payload: JobApplicationUpdate) -> JobApplication:
    application = JobTrackerService.update_application(application_id, payload)
    if not application:
        raise HTTPException(status_code=404, detail="Job application not found")
    return application


@api_router.post("/applications/{application_id}/coach", response_model=CareerToolResponse, tags=["applications"], summary="Get AI follow-up guidance for an application")
def coach_application(application_id: str) -> CareerToolResponse:
    application = JobTrackerService.get_application(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Job application not found")
    return CareerService.coach_application(application)


@api_router.post("/assets/photos/upload", response_model=MediaItem, tags=["assets"], summary="Upload photo")
def upload_photo(photo: UploadFile = File(...)) -> MediaItem:
    return MediaService.save_photo(photo)


@api_router.post("/assets/photos/professionalize", response_model=PhotoStudioResponse, tags=["assets"], summary="Convert uploaded photo into CV-ready headshot")
def professionalize_photo(payload: PhotoStudioRequest) -> PhotoStudioResponse:
    try:
        return MediaService.professionalize_photo(payload)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Photo not found")

@api_router.post("/assets/templates/upload", response_model=MediaItem, tags=["assets"], summary="Upload template")
def upload_template(template: UploadFile = File(...)) -> MediaItem:
    return MediaService.save_template(template)
@api_router.get("/assets/templates", response_model=list[MediaItem], tags=["assets"], summary="List templates")
def list_templates() -> list[MediaItem]:
    return MediaService.list_templates()

@api_router.get("/assets/photos", response_model=list[MediaItem], tags=["assets"], summary="List photos")
def list_photos() -> list[MediaItem]:
    return MediaService.list_photos()


@api_router.post("/flows/document", response_model=DocumentFlowResponse, tags=["resume-flow"], summary="Start document flow")
def start_document_flow(payload: DocumentFlowStartRequest) -> DocumentFlowResponse:
    return DocumentFlowService.start_flow(payload)


@api_router.get("/flows/document/{session_id}", response_model=DocumentFlowResponse, tags=["resume-flow"], summary="Get document flow state")
def get_document_flow(session_id: str) -> DocumentFlowResponse:
    flow = DocumentFlowService.get_flow(session_id)
    if not flow:
        raise HTTPException(status_code=404, detail="Flow session not found")
    return flow


@api_router.post("/flows/document/{session_id}/answer", response_model=DocumentFlowResponse, tags=["resume-flow"], summary="Answer current flow step")
def answer_document_flow(session_id: str, payload: DocumentFlowAnswerRequest) -> DocumentFlowResponse:
    flow = DocumentFlowService.answer_step(session_id, payload.answer)
    if not flow:
        raise HTTPException(status_code=404, detail="Flow session not found")
    return flow


@api_router.post("/flows/document/{session_id}/generate-resume-draft", response_model=ResumeDraftResponse, tags=["resume-flow"], summary="Generate CV draft from completed flow")
def generate_resume_draft_from_flow(session_id: str) -> ResumeDraftResponse:
    draft = DocumentFlowService.generate_resume_draft(session_id)
    if not draft:
        raise HTTPException(status_code=400, detail="Completed CV flow required before draft generation")
    return draft

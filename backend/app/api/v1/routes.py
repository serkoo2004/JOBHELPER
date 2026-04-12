from fastapi import APIRouter, File, HTTPException, UploadFile
from backend.app.schemas.auth import LoginRequest, LoginResponse
from backend.app.schemas.profile import UserProfile, UserProfileCreate
from backend.app.schemas.resume import ResumeAnalyzeRequest, ResumeGenerateRequest, ResumeResponse
from backend.app.schemas.cover_letter import CoverLetterRequest, CoverLetterResponse
from backend.app.schemas.tracker import JobApplicationCreate, JobApplication, JobApplicationUpdate
from backend.app.schemas.media import MediaItem
from backend.app.services.auth_service import AuthService
from backend.app.services.cover_letter_service import CoverLetterService
from backend.app.services.job_tracker_service import JobTrackerService
from backend.app.services.media_service import MediaService
from backend.app.services.profile_service import ProfileService
from backend.app.services.resume_service import ResumeService

api_router = APIRouter()

@api_router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "Career Copilot API"}

@api_router.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    token = AuthService.login(payload.email)
    return LoginResponse(access_token=token, token_type="bearer")

@api_router.post("/profiles", response_model=UserProfile)
def create_profile(payload: UserProfileCreate) -> UserProfile:
    return ProfileService.create_profile(payload)

@api_router.get("/profiles/{user_id}", response_model=UserProfile)
def get_profile(user_id: str) -> UserProfile:
    profile = ProfileService.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@api_router.post("/resumes/analyze", response_model=ResumeResponse)
def analyze_resume(payload: ResumeAnalyzeRequest) -> ResumeResponse:
    return ResumeService.analyze_resume(payload)

@api_router.post("/resumes/generate", response_model=ResumeResponse)
def generate_resume(payload: ResumeGenerateRequest) -> ResumeResponse:
    return ResumeService.generate_resume(payload)

@api_router.post("/cover-letters/generate", response_model=CoverLetterResponse)
def generate_cover_letter(payload: CoverLetterRequest) -> CoverLetterResponse:
    return CoverLetterService.generate_cover_letter(payload)

@api_router.post("/applications", response_model=JobApplication)
def create_application(payload: JobApplicationCreate) -> JobApplication:
    return JobTrackerService.create_application(payload)

@api_router.get("/applications", response_model=list[JobApplication])
def list_applications() -> list[JobApplication]:
    return JobTrackerService.list_applications()

@api_router.get("/applications/{application_id}", response_model=JobApplication)
def get_application(application_id: str) -> JobApplication:
    application = JobTrackerService.get_application(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Job application not found")
    return application

@api_router.patch("/applications/{application_id}", response_model=JobApplication)
def update_application(application_id: str, payload: JobApplicationUpdate) -> JobApplication:
    application = JobTrackerService.update_application(application_id, payload)
    if not application:
        raise HTTPException(status_code=404, detail="Job application not found")
    return application
@api_router.post("/assets/photos/upload", response_model=MediaItem)
def upload_photo(photo: UploadFile = File(...)) -> MediaItem:
    return MediaService.save_photo(photo)

@api_router.post("/assets/templates/upload", response_model=MediaItem)
def upload_template(template: UploadFile = File(...)) -> MediaItem:
    return MediaService.save_template(template)
@api_router.get("/assets/templates", response_model=list[MediaItem])
def list_templates() -> list[MediaItem]:
    return MediaService.list_templates()

@api_router.get("/assets/photos", response_model=list[MediaItem])
def list_photos() -> list[MediaItem]:
    return MediaService.list_photos()

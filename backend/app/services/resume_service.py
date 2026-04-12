from backend.app.schemas.resume import ResumeAnalyzeRequest, ResumeGenerateRequest, ResumeResponse
from backend.app.services.ai_chat_service import AiChatService


class ResumeService:
    @staticmethod
    def analyze_resume(payload: ResumeAnalyzeRequest) -> ResumeResponse:
        result = AiChatService.analyze_resume(payload.content, payload.target_role)
        return ResumeResponse(
            title=result["title"],
            summary=result["summary"],
            content=result["content"],
            recommendations=result["recommendations"],
            template=None,
        )

    @staticmethod
    def generate_resume(payload: ResumeGenerateRequest) -> ResumeResponse:
        result = AiChatService.generate_resume(payload.profile.model_dump(), payload.target_role)
        return ResumeResponse(
            title=result["title"],
            summary=result["summary"],
            content=result["content"],
            recommendations=result["recommendations"],
            template=payload.template,
        )

import time
from collections import defaultdict, deque
from uuid import uuid4

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.v1.routes import api_router
from backend.app.core.config import settings
from backend.app.core.db import create_db_and_tables
from backend.app.services.audit_service import AuditService

app = FastAPI(
    title=settings.project_name,
    description=(
        "AI Career Copilot backend.\n\n"
        "Önerilen kullanım sırası:\n"
        "1. CV flow başlat\n"
        "2. Soruları adım adım cevapla\n"
        "3. Flow'dan draft üret\n"
        "4. Draft'ı finalize et\n"
        "5. PDF veya DOCX export al"
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    openapi_tags=[
        {"name": "system", "description": "Sağlık ve temel sistem uçları."},
        {"name": "admin", "description": "Admin key ile korunan audit ve yönetim uçları."},
        {"name": "profiles", "description": "Kullanıcı profil verisi ve zengin CV girdileri."},
        {"name": "auth", "description": "Kimlik doğrulama ve AI oturum geçmişi."},
        {"name": "resume-flow", "description": "Adım adım CV akışı ve flow tabanlı draft üretimi."},
        {"name": "resume-drafts", "description": "CV draft oluşturma, düzenleme, finalize ve export akışı."},
        {"name": "resume-tools", "description": "Şablon listesi, direkt üretim ve analiz araçları."},
        {"name": "career-tools", "description": "İş ilanı eşleme, LinkedIn optimizasyonu, portföy ve mülakat araçları."},
        {"name": "cover-letters", "description": "Ön yazı üretimi."},
        {"name": "applications", "description": "Başvuru takip uçları."},
        {"name": "assets", "description": "Şablon ve fotoğraf varlıkları."},
    ],
)

_rate_limit_store: dict[str, deque[float]] = defaultdict(deque)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_guardrails(request, call_next):
    request_id = uuid4().hex
    start = time.perf_counter()
    client_ip = request.client.host if request.client else "unknown"

    if settings.rate_limit_enabled and not request.url.path.startswith(("/docs", "/openapi.json", "/redoc")):
        now = time.time()
        window = settings.rate_limit_window_seconds
        bucket = _rate_limit_store[client_ip]
        while bucket and now - bucket[0] > window:
            bucket.popleft()
        if len(bucket) >= settings.rate_limit_max_requests:
            response = JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests. Please slow down and try again shortly.",
                    "request_id": request_id,
                },
            )
            response.headers["x-request-id"] = request_id
            return response
        bucket.append(now)

    response = await call_next(request)
    response.headers["x-request-id"] = request_id

    duration_ms = int((time.perf_counter() - start) * 1000)
    try:
        AuditService.log_request(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            client_ip=client_ip,
            user_agent=request.headers.get("user-agent"),
            duration_ms=duration_ms,
        )
    except Exception:
        pass
    return response

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Career Copilot backend is running."}

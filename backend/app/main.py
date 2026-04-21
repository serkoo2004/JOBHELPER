import time
from collections import defaultdict, deque
from uuid import uuid4

from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse, JSONResponse
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
    docs_url=None,
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

cors_allow_credentials = settings.allow_credentials and "*" not in settings.allow_origins

_rate_limit_store: dict[str, deque[float]] = defaultdict(deque)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=cors_allow_credentials,
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


@app.get("/docs", include_in_schema=False)
def custom_swagger_ui_html() -> HTMLResponse:
    swagger = get_swagger_ui_html(
        openapi_url=app.openapi_url or "/openapi.json",
        title=f"{app.title} - Swagger UI",
        swagger_ui_parameters={
            "defaultModelsExpandDepth": -1,
            "displayRequestDuration": True,
            "docExpansion": "list",
            "persistAuthorization": True,
            "syntaxHighlight.theme": "obsidian",
        },
    )
    dark_styles = """
    <style>
      :root {
        color-scheme: dark;
        --cc-bg: #0b1020;
        --cc-panel: #121a30;
        --cc-panel-2: #19233f;
        --cc-border: #2a365d;
        --cc-text: #e8ecff;
        --cc-muted: #9fadd6;
        --cc-accent: #6ea8fe;
        --cc-green: #34d399;
      }
      body, .swagger-ui {
        background: radial-gradient(circle at top, #1a2546 0%, var(--cc-bg) 45%, #060913 100%) !important;
        color: var(--cc-text) !important;
      }
      .swagger-ui .topbar {
        background: rgba(8, 12, 24, 0.92) !important;
        border-bottom: 1px solid var(--cc-border);
        backdrop-filter: blur(10px);
      }
      .swagger-ui .info, .swagger-ui .scheme-container, .swagger-ui .wrapper {
        background: transparent !important;
      }
      .swagger-ui .info .title,
      .swagger-ui .info p,
      .swagger-ui .info li,
      .swagger-ui .opblock-tag,
      .swagger-ui .response-col_status,
      .swagger-ui .response-col_description,
      .swagger-ui .parameter__name,
      .swagger-ui .parameter__type,
      .swagger-ui .tab li,
      .swagger-ui label,
      .swagger-ui .model-title,
      .swagger-ui .prop-name,
      .swagger-ui .opblock-summary-description,
      .swagger-ui .opblock-description-wrapper p,
      .swagger-ui .responses-inner h4,
      .swagger-ui .responses-inner h5,
      .swagger-ui .markdown p,
      .swagger-ui .markdown li,
      .swagger-ui section.models h4,
      .swagger-ui section.models h5,
      .swagger-ui .btn,
      .swagger-ui .authorization__btn,
      .swagger-ui .opblock-summary-method,
      .swagger-ui .opblock-summary-path,
      .swagger-ui .opblock-summary-path__deprecated {
        color: var(--cc-text) !important;
      }
      .swagger-ui .info .base-url,
      .swagger-ui .info a,
      .swagger-ui .link,
      .swagger-ui .opblock-tag small,
      .swagger-ui .parameter__deprecated,
      .swagger-ui .model-hint,
      .swagger-ui .renderedMarkdown code,
      .swagger-ui .response-col_links,
      .swagger-ui .responses-table .response-col_description__inner div.markdown p,
      .swagger-ui .responses-table .response-col_description__inner div.renderedMarkdown p {
        color: var(--cc-muted) !important;
      }
      .swagger-ui .scheme-container,
      .swagger-ui .opblock,
      .swagger-ui .model-box,
      .swagger-ui .responses-table,
      .swagger-ui table tbody tr td,
      .swagger-ui .dialog-ux .modal-ux,
      .swagger-ui .auth-container,
      .swagger-ui .authorization__btn,
      .swagger-ui .opblock-section-header,
      .swagger-ui .parameters-col_description input,
      .swagger-ui textarea,
      .swagger-ui input[type=text],
      .swagger-ui input[type=password],
      .swagger-ui select {
        background: var(--cc-panel) !important;
        border-color: var(--cc-border) !important;
        color: var(--cc-text) !important;
        box-shadow: none !important;
      }
      .swagger-ui .opblock .opblock-summary,
      .swagger-ui .opblock-section-header,
      .swagger-ui .tab li {
        background: var(--cc-panel-2) !important;
      }
      .swagger-ui .opblock-tag {
        border-bottom-color: var(--cc-border) !important;
      }
      .swagger-ui .btn.execute {
        background: linear-gradient(135deg, var(--cc-green), #10b981) !important;
        color: #04110d !important;
        border: none !important;
      }
      .swagger-ui .btn.authorize,
      .swagger-ui .btn.cancel,
      .swagger-ui .btn.clear,
      .swagger-ui .btn.try-out__btn {
        background: var(--cc-panel-2) !important;
        border-color: var(--cc-border) !important;
      }
      .swagger-ui .opblock.opblock-get {
        background: rgba(49, 140, 231, 0.12) !important;
        border-color: rgba(49, 140, 231, 0.32) !important;
      }
      .swagger-ui .opblock.opblock-post {
        background: rgba(52, 211, 153, 0.12) !important;
        border-color: rgba(52, 211, 153, 0.32) !important;
      }
      .swagger-ui .opblock.opblock-patch {
        background: rgba(251, 191, 36, 0.12) !important;
        border-color: rgba(251, 191, 36, 0.32) !important;
      }
      .swagger-ui .opblock.opblock-delete {
        background: rgba(248, 113, 113, 0.12) !important;
        border-color: rgba(248, 113, 113, 0.32) !important;
      }
      .swagger-ui .topbar .download-url-wrapper { display: none !important; }
    </style>
    """
    html = swagger.body.decode("utf-8").replace("</head>", f"{dark_styles}</head>")
    return HTMLResponse(content=html)


@app.get("/health", tags=["system"], summary="Root health check")
def root_health_check() -> dict[str, str]:
    return {"status": "ok", "service": "Career Copilot API"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.v1.routes import api_router
from backend.app.core.config import settings
from backend.app.core.db import create_db_and_tables

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
        {"name": "profiles", "description": "Kullanıcı profil verisi ve zengin CV girdileri."},
        {"name": "resume-flow", "description": "Adım adım CV akışı ve flow tabanlı draft üretimi."},
        {"name": "resume-drafts", "description": "CV draft oluşturma, düzenleme, finalize ve export akışı."},
        {"name": "resume-tools", "description": "Şablon listesi, direkt üretim ve analiz araçları."},
        {"name": "career-tools", "description": "İş ilanı eşleme, LinkedIn optimizasyonu, portföy ve mülakat araçları."},
        {"name": "cover-letters", "description": "Ön yazı üretimi."},
        {"name": "applications", "description": "Başvuru takip uçları."},
        {"name": "assets", "description": "Şablon ve fotoğraf varlıkları."},
        {"name": "auth", "description": "Kimlik doğrulama iskeleti."},
    ],
)


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

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Career Copilot backend is running."}

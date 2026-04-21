import base64
from io import BytesIO
import json
from pathlib import Path
import random
import time
import uuid

from fastapi import UploadFile
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps
import requests
from sqlmodel import select

from backend.app.core.db import get_session
from backend.app.core.config import settings
from backend.app.models.profile import ProfileModel
from backend.app.schemas.media import (
    MediaItem,
    ProfilePhotoRequest,
    PhotoStudioPlacement,
    PhotoStudioRequest,
    PhotoStudioResponse,
)


class PhotoGenerationError(RuntimeError):
    def __init__(self, message: str, status_code: int = 502, public_message: str | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.public_message = public_message or "Photo generation failed. Please try again later."


class MediaService:
    PUBLIC_BASE = Path(__file__).resolve().parents[3] / 'frontend' / 'public'
    PHOTO_UPLOAD_DIR = PUBLIC_BASE / 'uploads' / 'photos'
    PHOTO_PROCESSED_DIR = PUBLIC_BASE / 'photos' / 'processed'
    IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}
    TEMPLATE_EXTENSIONS = IMAGE_EXTENSIONS | {".pdf"}
    COMFYUI_CHECKPOINT = "realisticVisionV60B1_v51HyperVAE.safetensors"
    COMFYUI_FACEID_PRESET = "FACEID PLUS V2"
    COMFYUI_CLIP_VISION = "CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors"
    TEMPLATE_PHOTO_LAYOUTS = {
        "modern_sidebar": ("circle", "sidebar_top", "medium"),
        "executive_grid": ("circle", "header_left", "small"),
        "minimal_ats": ("hidden", "none", "none"),
        "edinburgh_profile": ("circle", "sidebar_top", "large"),
        "royal_timeline": ("circle", "sidebar_top", "large"),
        "classic_timeline": ("square", "header_right", "small"),
        "burgundy_panel": ("circle", "sidebar_top", "medium"),
        "crimson_edge": ("circle", "header_left", "small"),
        "onyx_accent": ("circle", "header_left", "small"),
    }

    @classmethod
    def list_templates(cls) -> list[MediaItem]:
        template_dir = cls.PUBLIC_BASE / 'templates'
        if not template_dir.exists():
            return []
        return [
            MediaItem(name=item.name, path=f"/templates/{item.name}")
            for item in sorted(template_dir.iterdir())
            if cls._is_allowed_media_file(item, cls.TEMPLATE_EXTENSIONS)
        ]

    @classmethod
    def list_photos(cls) -> list[MediaItem]:
        photo_dir = cls.PHOTO_UPLOAD_DIR
        if not photo_dir.exists():
            return []
        return [
            MediaItem(name=item.name, path=f"/uploads/photos/{item.name}")
            for item in sorted(photo_dir.iterdir())
            if cls._is_allowed_media_file(item, cls.IMAGE_EXTENSIONS)
        ]

    @classmethod
    def list_generated_photos(cls) -> list[MediaItem]:
        if not cls.PHOTO_PROCESSED_DIR.exists():
            return []
        return [
            MediaItem(name=item.name, path=f"/photos/processed/{item.name}")
            for item in sorted(cls.PHOTO_PROCESSED_DIR.iterdir(), key=lambda path: path.stat().st_mtime, reverse=True)
            if cls._is_allowed_media_file(item, cls.IMAGE_EXTENSIONS) and "-preview" not in item.stem
        ]

    @classmethod
    def delete_photo(cls, photo_path: str) -> bool:
        resolved = cls._resolve_managed_photo_path(photo_path)
        if resolved is None:
            return False

        deleted_paths = cls._related_photo_paths(resolved)
        for path in deleted_paths:
            if path.is_file():
                path.unlink()

        deleted_public_paths = {cls._public_path_for(path) for path in deleted_paths}
        with get_session() as session:
            profiles = session.exec(select(ProfileModel)).all()
            changed = False
            for profile in profiles:
                if profile.photo_url in deleted_public_paths:
                    profile.photo_url = None
                    session.add(profile)
                    changed = True
            if changed:
                session.commit()
        return True

    @classmethod
    def set_profile_photo(cls, payload: ProfilePhotoRequest) -> MediaItem:
        resolved = cls._resolve_managed_photo_path(payload.photo_path)
        if resolved is None:
            raise FileNotFoundError("Photo could not be resolved")

        public_path = cls._public_path_for(resolved)
        with get_session() as session:
            profile = session.get(ProfileModel, payload.profile_id)
            if not profile:
                raise FileNotFoundError("Profile could not be resolved")
            profile.photo_url = public_path
            session.add(profile)
            session.commit()
        return MediaItem(name=resolved.name, path=public_path)

    @classmethod
    def save_photo(cls, file: UploadFile) -> MediaItem:
        cls._validate_uploaded_extension(file.filename or "", cls.IMAGE_EXTENSIONS, "photo")
        photo_dir = cls.PHOTO_UPLOAD_DIR
        photo_dir.mkdir(parents=True, exist_ok=True)
        destination = photo_dir / file.filename
        with destination.open('wb') as buffer:
            buffer.write(file.file.read())
        return MediaItem(name=file.filename, path=f"/uploads/photos/{file.filename}")

    @classmethod
    def professionalize_photo(cls, payload: PhotoStudioRequest) -> PhotoStudioResponse:
        source = cls._resolve_photo_path(payload.photo_path)
        if source is None:
            raise FileNotFoundError("Photo could not be resolved")
        if settings.photo_provider == "google" and not settings.google_api_key:
            raise RuntimeError("GOOGLE_API_KEY is required for AI portrait generation.")
        if settings.photo_provider not in {"google", "comfyui"}:
            raise RuntimeError(f"Unsupported PHOTO_PROVIDER: {settings.photo_provider}")

        processed_dir = cls.PHOTO_PROCESSED_DIR
        processed_dir.mkdir(parents=True, exist_ok=True)

        source_path = Path(source)
        stem = source_path.stem
        processed_name = f"{stem}-ai-portrait.png"
        preview_name = f"{stem}-ai-portrait-preview.png"
        processed_path = processed_dir / processed_name
        preview_path = processed_dir / preview_name
        metadata_path = processed_dir / f"{stem}.photo.json"

        prompt = cls._build_ai_portrait_prompt(payload.style)
        generated_bytes, provider, model = cls._generate_ai_portrait(source_path, prompt)

        processed_path.write_bytes(generated_bytes)
        with Image.open(processed_path) as generated:
            preview = cls._build_preview_variant(generated.convert("RGB"))
            preview.save(preview_path, format="PNG", optimize=True)

        placement = cls._placement_for_template(payload.template)
        metadata = {
            "original_path": payload.photo_path,
            "processed_path": f"/photos/processed/{processed_name}",
            "preview_path": f"/photos/processed/{preview_name}",
            "style": "AI generated portrait",
            "prompt": prompt,
            "provider": provider,
            "model": model,
            "ai_generated": True,
            "placement": placement.model_dump(),
        }
        metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")

        recommendations = [
            f"Portre seçilen Markdown prompt ile gerçek AI image generator üzerinden üretildi ({provider}).",
            "Kimlik korunması için kaynak fotoğraf referans olarak gönderildi; prompt yüz, sakal, saç ve ten tonunu korumayı özellikle ister.",
            "Prompt presetleri backend/app/prompts/photo_studio altında Markdown olarak tutuluyor.",
        ]
        return PhotoStudioResponse(
            original_path=payload.photo_path,
            processed_path=f"/photos/processed/{processed_name}",
            preview_path=f"/photos/processed/{preview_name}",
            style="AI generated portrait",
            placement=placement,
            recommendations=recommendations,
        )

    @classmethod
    def save_template(cls, file: UploadFile) -> MediaItem:
        cls._validate_uploaded_extension(file.filename or "", cls.TEMPLATE_EXTENSIONS, "template")
        template_dir = cls.PUBLIC_BASE / 'templates'
        template_dir.mkdir(parents=True, exist_ok=True)
        destination = template_dir / file.filename
        with destination.open('wb') as buffer:
            buffer.write(file.file.read())
        return MediaItem(name=file.filename, path=f"/templates/{file.filename}")

    @classmethod
    def _resolve_photo_path(cls, photo_path: str) -> str | None:
        candidate = Path(photo_path)
        if candidate.is_file():
            return str(candidate)

        raw = photo_path.replace("\\", "/").lstrip("/")
        for possible in (
            cls.PUBLIC_BASE / raw,
            cls.PUBLIC_BASE / "photos" / Path(raw).name,
            cls.PHOTO_UPLOAD_DIR / Path(raw).name,
            Path(__file__).resolve().parents[3] / "assets" / "profile_photos" / Path(raw).name,
        ):
            if possible.is_file():
                return str(possible)
        return None

    @classmethod
    def _resolve_managed_photo_path(cls, photo_path: str) -> Path | None:
        resolved = cls._resolve_photo_path(photo_path)
        if not resolved:
            return None
        path = Path(resolved).resolve()
        allowed_roots = [cls.PHOTO_UPLOAD_DIR.resolve(), cls.PHOTO_PROCESSED_DIR.resolve()]
        if not any(path == root or root in path.parents for root in allowed_roots):
            return None
        if not cls._is_allowed_media_file(path, cls.IMAGE_EXTENSIONS):
            return None
        return path

    @classmethod
    def _related_photo_paths(cls, photo_path: Path) -> set[Path]:
        paths = {photo_path}
        if photo_path.parent.resolve() == cls.PHOTO_UPLOAD_DIR.resolve():
            return {path for path in paths if path.is_file()}
        if photo_path.parent.resolve() == cls.PHOTO_PROCESSED_DIR.resolve():
            stem = photo_path.stem
            related_variants = {
                "-ai-portrait": ("-ai-portrait.png", "-ai-portrait-preview.png"),
                "-ai-portrait-preview": ("-ai-portrait.png", "-ai-portrait-preview.png"),
                "-studio": ("-studio.png", "-studio-preview.png"),
                "-studio-preview": ("-studio.png", "-studio-preview.png"),
            }
            for suffix, variant_names in related_variants.items():
                if stem.endswith(suffix):
                    base_stem = stem[: -len(suffix)]
                    paths.add(cls.PHOTO_PROCESSED_DIR / f"{base_stem}.photo.json")
                    for variant_name in variant_names:
                        paths.add(cls.PHOTO_PROCESSED_DIR / f"{base_stem}{variant_name}")
                    break
        return {path for path in paths if path.is_file()}

    @classmethod
    def _public_path_for(cls, photo_path: Path) -> str:
        resolved = photo_path.resolve()
        public_base = cls.PUBLIC_BASE.resolve()
        relative = resolved.relative_to(public_base).as_posix()
        return f"/{relative}"

    @classmethod
    def _is_allowed_media_file(cls, path: Path, extensions: set[str]) -> bool:
        return path.is_file() and not path.name.startswith(".") and path.suffix.lower() in extensions

    @staticmethod
    def _validate_uploaded_extension(filename: str, extensions: set[str], label: str) -> None:
        suffix = Path(filename).suffix.lower()
        if suffix not in extensions:
            allowed = ", ".join(sorted(extensions))
            raise ValueError(f"Unsupported {label} file type. Allowed extensions: {allowed}")

    @classmethod
    def _placement_for_template(cls, template: str | None) -> PhotoStudioPlacement:
        key = template or "modern_sidebar"
        shape, align, size_hint = cls.TEMPLATE_PHOTO_LAYOUTS.get(key, cls.TEMPLATE_PHOTO_LAYOUTS["modern_sidebar"])
        notes = {
            "circle": "Yuvarlak crop premium ve editorial şablonlarda daha iyi durur.",
            "square": "Daha kurumsal timeline düzenlerde kontrollü kare foto daha dengeli olabilir.",
            "hidden": "ATS-safe modda fotoğraf opsiyonel tutulmalı.",
        }
        return PhotoStudioPlacement(
            template=key,
            shape=shape,
            align=align,
            size_hint=size_hint,
            notes=[notes.get(shape, "Template için kontrollü foto yerleşimi kullanılmalı.")],
        )

    @staticmethod
    def _build_ai_portrait_prompt(style: str | None) -> str:
        user_prompt = (style or "").strip()
        if not user_prompt:
            user_prompt = (
                "Create a photorealistic professional CV and LinkedIn portrait from the reference image. "
                "Preserve the person's real identity, facial structure, beard, hair, skin tone, and natural expression. "
                "Use formal business attire, clean gray studio background, soft professional lighting, realistic skin texture, "
                "sharp eyes, and a premium but natural business finish."
            )
        return (
            "Generate a new professional portrait using the uploaded image only as the identity reference. "
            "Preserve the exact same face and identity. Do not change the person's face, facial proportions, eyes, nose, mouth, beard, hairline, skin tone, or recognizable likeness. "
            "Only change styling, clothing, lighting, and background according to the selected prompt. "
            "Do not invent a different face. Do not beautify into another person. "
            f"{user_prompt}"
        )

    @classmethod
    def _generate_ai_portrait(cls, source_path: Path, prompt: str) -> tuple[bytes, str, str]:
        source_buffer = BytesIO()
        with Image.open(source_path) as source_image:
            source_image.convert("RGBA").save(source_buffer, format="PNG")
        source_buffer.seek(0)

        if settings.photo_provider == "comfyui":
            return cls._generate_comfyui_portrait(source_buffer, prompt), "comfyui", "local-comfyui"

        return cls._generate_google_portrait(source_buffer, prompt), "google", settings.google_image_model

    @staticmethod
    def _generate_comfyui_portrait(source_buffer: BytesIO, prompt: str) -> bytes:
        prepared_source = MediaService._prepare_comfyui_reference(source_buffer)
        try:
            health = requests.get(f"{settings.comfyui_url}/system_stats", timeout=5)
        except requests.RequestException as exc:
            raise PhotoGenerationError(f"ComfyUI is not reachable at {settings.comfyui_url}: {exc}") from exc
        if not health.ok:
            raise PhotoGenerationError(f"ComfyUI health check failed: {health.status_code} {health.text[:300]}")

        upload_name = f"career-copilot-reference-{uuid.uuid4().hex}.png"
        uploaded_name = MediaService._upload_comfyui_image(prepared_source, upload_name)
        prompt_id = MediaService._queue_comfyui_prompt(uploaded_name, prompt)
        image_info = MediaService._wait_for_comfyui_output(prompt_id)
        return MediaService._download_comfyui_image(image_info)

    @staticmethod
    def _prepare_comfyui_reference(source_buffer: BytesIO) -> BytesIO:
        source_buffer.seek(0)
        with Image.open(source_buffer) as image:
            image = image.convert("RGB")
            image.thumbnail((640, 768), Image.Resampling.LANCZOS)
            width = max(64, image.width - (image.width % 8))
            height = max(64, image.height - (image.height % 8))
            image = image.resize((width, height), Image.Resampling.LANCZOS)
            output = BytesIO()
            image.save(output, format="PNG", optimize=True)
            output.seek(0)
            return output

    @staticmethod
    def _upload_comfyui_image(image_buffer: BytesIO, filename: str) -> str:
        image_buffer.seek(0)
        response = requests.post(
            f"{settings.comfyui_url}/upload/image",
            data={"type": "input", "overwrite": "true"},
            files={"image": (filename, image_buffer, "image/png")},
            timeout=60,
        )
        if not response.ok:
            raise PhotoGenerationError(MediaService._format_provider_error("ComfyUI upload", response))
        payload = response.json()
        return payload.get("name") or filename

    @staticmethod
    def _queue_comfyui_prompt(uploaded_name: str, prompt: str) -> str:
        workflow = MediaService._build_comfyui_workflow(uploaded_name, prompt)
        response = requests.post(
            f"{settings.comfyui_url}/prompt",
            json={"prompt": workflow, "client_id": f"career-copilot-{uuid.uuid4().hex}"},
            timeout=30,
        )
        if not response.ok:
            raise PhotoGenerationError(MediaService._format_provider_error("ComfyUI prompt", response))
        prompt_id = response.json().get("prompt_id")
        if not prompt_id:
            raise PhotoGenerationError("ComfyUI did not return a prompt id.")
        return prompt_id

    @staticmethod
    def _wait_for_comfyui_output(prompt_id: str) -> dict:
        deadline = time.time() + 240
        while time.time() < deadline:
            response = requests.get(f"{settings.comfyui_url}/history/{prompt_id}", timeout=10)
            if response.ok:
                history = response.json().get(prompt_id)
                if history:
                    outputs = history.get("outputs") or {}
                    for output in outputs.values():
                        images = output.get("images") or []
                        if images:
                            return images[0]
                    status = history.get("status") or {}
                    if status.get("status_str") == "error":
                        raise PhotoGenerationError(f"ComfyUI workflow failed: {status}")
            time.sleep(2)
        raise PhotoGenerationError("ComfyUI generation timed out.")

    @staticmethod
    def _download_comfyui_image(image_info: dict) -> bytes:
        response = requests.get(
            f"{settings.comfyui_url}/view",
            params={
                "filename": image_info.get("filename"),
                "subfolder": image_info.get("subfolder", ""),
                "type": image_info.get("type", "output"),
            },
            timeout=60,
        )
        if not response.ok:
            raise PhotoGenerationError(MediaService._format_provider_error("ComfyUI image download", response))
        return response.content

    @staticmethod
    def _build_comfyui_workflow(uploaded_name: str, prompt: str) -> dict:
        positive = (
            f"{prompt} photorealistic professional studio portrait, realistic skin texture, sharp eyes, "
            "natural expression, accurate facial identity, accurate face shape, accurate hairline, "
            "premium LinkedIn headshot, seamless plain studio background, smooth background gradient, "
            "no visible furniture, no chair, no props, high-end commercial photography"
        )
        negative = (
            "different person, wrong identity, changed face, changed nose, changed eyes, changed mouth, changed beard, "
            "changed hairline, older person, younger person, unrecognizable face, distorted face, deformed facial features, "
            "cropped head, cut off hair, bad anatomy, cartoon, illustration, painting, plastic skin, over-smoothed skin, "
            "blurry, low resolution, extra objects, cluttered background, black object behind head, black shape behind head, "
            "chair, headrest, office chair, furniture, curtain, coat hanging behind, shadow blob, watermark, text, logo"
        )
        return {
            "1": {
                "class_type": "CheckpointLoaderSimple",
                "inputs": {"ckpt_name": MediaService.COMFYUI_CHECKPOINT},
            },
            "2": {
                "class_type": "IPAdapterUnifiedLoaderFaceID",
                "inputs": {
                    "model": ["1", 0],
                    "preset": MediaService.COMFYUI_FACEID_PRESET,
                    "lora_strength": 0.65,
                    "provider": "CUDA",
                },
            },
            "3": {
                "class_type": "LoadImage",
                "inputs": {"image": uploaded_name},
            },
            "4": {
                "class_type": "CLIPVisionLoader",
                "inputs": {"clip_name": MediaService.COMFYUI_CLIP_VISION},
            },
            "5": {
                "class_type": "IPAdapterInsightFaceLoader",
                "inputs": {"provider": "CUDA", "model_name": "buffalo_l"},
            },
            "6": {
                "class_type": "IPAdapterFaceID",
                "inputs": {
                    "model": ["2", 0],
                    "ipadapter": ["2", 1],
                    "image": ["3", 0],
                    "weight": 1.15,
                    "weight_faceidv2": 1.55,
                    "weight_type": "linear",
                    "combine_embeds": "average",
                    "start_at": 0.0,
                    "end_at": 1.0,
                    "embeds_scaling": "V only",
                    "clip_vision": ["4", 0],
                    "insightface": ["5", 0],
                },
            },
            "7": {
                "class_type": "CLIPTextEncode",
                "inputs": {"text": positive, "clip": ["1", 1]},
            },
            "8": {
                "class_type": "CLIPTextEncode",
                "inputs": {"text": negative, "clip": ["1", 1]},
            },
            "9": {
                "class_type": "EmptyLatentImage",
                "inputs": {"width": 512, "height": 640, "batch_size": 1},
            },
            "10": {
                "class_type": "KSampler",
                "inputs": {
                    "model": ["6", 0],
                    "positive": ["7", 0],
                    "negative": ["8", 0],
                    "latent_image": ["9", 0],
                    "seed": random.randint(1, 2**32 - 1),
                    "steps": 24,
                    "cfg": 5.5,
                    "sampler_name": "dpmpp_2m",
                    "scheduler": "karras",
                    "denoise": 1.0,
                },
            },
            "11": {
                "class_type": "VAEDecode",
                "inputs": {"samples": ["10", 0], "vae": ["1", 2]},
            },
            "12": {
                "class_type": "SaveImage",
                "inputs": {"images": ["11", 0], "filename_prefix": "career_copilot/portrait"},
            },
        }

    @staticmethod
    def _generate_google_portrait(source_buffer: BytesIO, prompt: str) -> bytes:
        source_buffer.seek(0)
        image_b64 = base64.b64encode(source_buffer.getvalue()).decode("ascii")
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{settings.google_image_model}:generateContent",
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": settings.google_api_key or "",
            },
            json={
                "contents": [
                    {
                        "parts": [
                            {"text": prompt},
                            {
                                "inline_data": {
                                    "mime_type": "image/png",
                                    "data": image_b64,
                                }
                            },
                        ]
                    }
                ]
            },
            timeout=180,
        )
        if not response.ok:
            message = MediaService._format_provider_error("Google image", response)
            if response.status_code == 429:
                raise PhotoGenerationError(
                    message,
                    status_code=429,
                    public_message="Photo generation is temporarily unavailable. Please try again later.",
                )
            raise PhotoGenerationError(message)

        payload = response.json()
        parts = ((payload.get("candidates") or [{}])[0].get("content") or {}).get("parts") or []
        for part in parts:
            inline_data = part.get("inlineData") or part.get("inline_data")
            if inline_data and inline_data.get("data"):
                return base64.b64decode(inline_data["data"])
        raise PhotoGenerationError("Google image generation did not return image data.")

    @staticmethod
    def _format_provider_error(provider: str, response: requests.Response) -> str:
        try:
            payload = response.json()
            error = payload.get("error") or {}
            message = str(error.get("message") or response.reason or "Unknown error")
            code = error.get("code") or error.get("status") or "unknown"
            return f"{provider} failed ({response.status_code} {code}): {message[:300]}"
        except ValueError:
            return f"{provider} failed ({response.status_code}): {response.text[:300]}"

    @staticmethod
    def _build_studio_headshot(image: Image.Image, style: str) -> Image.Image:
        portrait_size = (960, 1200)
        portrait = ImageOps.fit(
            image,
            portrait_size,
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.34),
        )
        portrait = ImageOps.autocontrast(portrait, cutoff=0.5)
        portrait = ImageEnhance.Color(portrait).enhance(1.0)
        portrait = ImageEnhance.Contrast(portrait).enhance(1.03)
        portrait = ImageEnhance.Sharpness(portrait).enhance(1.06)

        if any(keyword in style for keyword in ["black and white", "grayscale", "siyah beyaz", "monochrome"]):
            portrait = ImageOps.grayscale(portrait).convert("RGB")
            portrait = ImageEnhance.Contrast(portrait).enhance(1.08)
            portrait = ImageEnhance.Sharpness(portrait).enhance(1.06)

        vignette = Image.new("L", portrait_size, 255)
        vignette_draw = ImageDraw.Draw(vignette)
        vignette_draw.ellipse(
            (
                portrait_size[0] * 0.03,
                portrait_size[1] * 0.02,
                portrait_size[0] * 0.97,
                portrait_size[1] * 0.98,
            ),
            fill=0,
        )
        vignette = vignette.filter(ImageFilter.GaussianBlur(radius=110))
        shadow = Image.new("RGB", portrait_size, "#0f1115")
        studio = Image.composite(shadow, portrait, vignette.point(lambda value: int(value * 0.22)))

        top_light = Image.new("RGBA", portrait_size, (255, 255, 255, 0))
        top_draw = ImageDraw.Draw(top_light)
        top_draw.ellipse(
            (
                portrait_size[0] * 0.18,
                -portrait_size[1] * 0.08,
                portrait_size[0] * 0.82,
                portrait_size[1] * 0.45,
            ),
            fill=(255, 255, 255, 12),
        )
        return Image.alpha_composite(studio.convert("RGBA"), top_light).convert("RGB")

    @staticmethod
    def _normalize_style(style: str | None, template: str | None = None) -> str:
        raw = (style or "").strip().lower()
        if not raw:
            return MediaService._auto_style_for_template(template)
        if any(keyword in raw for keyword in ["black and white", "bw", "grayscale", "siyah beyaz", "siyah-beyaz", "monochrome"]):
            return "black and white premium CV headshot"
        if "executive" in raw:
            return "executive dark corporate portrait"
        if "cv" in raw or "vesikal" in raw or "professional" in raw:
            return "professional dark background"
        return raw

    @staticmethod
    def _auto_style_for_template(template: str | None) -> str:
        key = (template or "").strip().lower()
        if key in {"edinburgh_profile", "royal_timeline", "onyx_accent"}:
            return "black and white premium CV headshot"
        if key in {"executive_grid", "classic_timeline", "crimson_edge"}:
            return "executive dark corporate portrait"
        if key == "minimal_ats":
            return "professional dark background"
        return "professional dark background"

    @staticmethod
    def _build_preview_variant(image: Image.Image) -> Image.Image:
        preview = image.copy()
        preview.thumbnail((720, 1080), Image.Resampling.LANCZOS)
        return preview

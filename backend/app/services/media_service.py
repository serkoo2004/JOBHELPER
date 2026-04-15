import json
from pathlib import Path

from fastapi import UploadFile
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

from backend.app.schemas.media import (
    MediaItem,
    PhotoStudioPlacement,
    PhotoStudioRequest,
    PhotoStudioResponse,
)


class MediaService:
    PUBLIC_BASE = Path(__file__).resolve().parents[3] / 'frontend' / 'public'
    PHOTO_PROCESSED_DIR = PUBLIC_BASE / 'photos' / 'processed'
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
            if item.is_file()
        ]

    @classmethod
    def list_photos(cls) -> list[MediaItem]:
        photo_dir = cls.PUBLIC_BASE / 'photos'
        if not photo_dir.exists():
            return []
        return [
            MediaItem(name=item.name, path=f"/photos/{item.name}")
            for item in sorted(photo_dir.iterdir())
            if item.is_file()
        ]

    @classmethod
    def save_photo(cls, file: UploadFile) -> MediaItem:
        photo_dir = cls.PUBLIC_BASE / 'photos'
        photo_dir.mkdir(parents=True, exist_ok=True)
        destination = photo_dir / file.filename
        with destination.open('wb') as buffer:
            buffer.write(file.file.read())
        return MediaItem(name=file.filename, path=f"/photos/{file.filename}")

    @classmethod
    def professionalize_photo(cls, payload: PhotoStudioRequest) -> PhotoStudioResponse:
        source = cls._resolve_photo_path(payload.photo_path)
        if source is None:
            raise FileNotFoundError("Photo could not be resolved")

        processed_dir = cls.PHOTO_PROCESSED_DIR
        processed_dir.mkdir(parents=True, exist_ok=True)

        source_path = Path(source)
        stem = source_path.stem
        processed_name = f"{stem}-studio.png"
        preview_name = f"{stem}-studio-preview.png"
        processed_path = processed_dir / processed_name
        preview_path = processed_dir / preview_name
        metadata_path = processed_dir / f"{stem}.photo.json"

        with Image.open(source_path) as original:
            image = original.convert("RGB")
            normalized_style = cls._normalize_style(payload.style, payload.template)
            studio = cls._build_studio_headshot(image, normalized_style)
            preview = cls._build_preview_variant(studio)
            studio.save(processed_path, format="PNG", optimize=True)
            preview.save(preview_path, format="PNG", optimize=True)

        placement = cls._placement_for_template(payload.template)
        metadata = {
            "original_path": payload.photo_path,
            "processed_path": f"/photos/processed/{processed_name}",
            "preview_path": f"/photos/processed/{preview_name}",
            "style": normalized_style,
            "placement": placement.model_dump(),
        }
        metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")

        recommendations = [
            "İşlenmiş headshot artık CV için daha kontrollü kadraj ve profesyonel arka plan kullanıyor.",
            "Fotoğraf kullanılacak template ATS-safe değilse görünür yerleşim tercih edilebilir.",
            "Çok resmi başvurularda renkli dekor yerine daha sade template seçmek daha güvenli olabilir.",
        ]
        return PhotoStudioResponse(
            original_path=payload.photo_path,
            processed_path=f"/photos/processed/{processed_name}",
            preview_path=f"/photos/processed/{preview_name}",
            style=normalized_style,
            placement=placement,
            recommendations=recommendations,
        )

    @classmethod
    def save_template(cls, file: UploadFile) -> MediaItem:
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
            Path(__file__).resolve().parents[3] / "assets" / "profile_photos" / Path(raw).name,
        ):
            if possible.is_file():
                return str(possible)
        return None

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
    def _build_studio_headshot(image: Image.Image, style: str) -> Image.Image:
        portrait_size = (960, 1200)
        portrait = ImageOps.fit(
            image,
            portrait_size,
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.22),
        )
        portrait = ImageOps.autocontrast(portrait, cutoff=1)
        portrait = ImageEnhance.Color(portrait).enhance(0.95)
        portrait = ImageEnhance.Contrast(portrait).enhance(1.08)
        portrait = ImageEnhance.Sharpness(portrait).enhance(1.18)

        if any(keyword in style for keyword in ["black and white", "grayscale", "siyah beyaz", "monochrome"]):
            portrait = ImageOps.grayscale(portrait).convert("RGB")
            portrait = ImageEnhance.Contrast(portrait).enhance(1.14)
            portrait = ImageEnhance.Sharpness(portrait).enhance(1.1)

        blurred = portrait.filter(ImageFilter.GaussianBlur(radius=24))
        dark_overlay = Image.new("RGB", portrait_size, "#151a22" if "black and white" in style or "grayscale" in style or "siyah beyaz" in style else "#1c2330")
        background = Image.blend(blurred, dark_overlay, 0.52)

        focus_mask = Image.new("L", portrait_size, 0)
        draw = ImageDraw.Draw(focus_mask)
        draw.ellipse(
            (
                portrait_size[0] * 0.10,
                portrait_size[1] * 0.02,
                portrait_size[0] * 0.90,
                portrait_size[1] * 0.82,
            ),
            fill=210,
        )
        focus_mask = focus_mask.filter(ImageFilter.GaussianBlur(radius=52))
        studio = Image.composite(portrait, background, focus_mask)

        vignette = Image.new("L", portrait_size, 255)
        vignette_draw = ImageDraw.Draw(vignette)
        vignette_draw.ellipse(
            (
                portrait_size[0] * 0.08,
                portrait_size[1] * 0.03,
                portrait_size[0] * 0.92,
                portrait_size[1] * 0.92,
            ),
            fill=0,
        )
        vignette = vignette.filter(ImageFilter.GaussianBlur(radius=90))
        shadow = Image.new("RGB", portrait_size, "#10151d")
        studio = Image.composite(shadow, studio, vignette)

        top_light = Image.new("RGBA", portrait_size, (255, 255, 255, 0))
        top_draw = ImageDraw.Draw(top_light)
        top_draw.ellipse(
            (
                portrait_size[0] * 0.18,
                -portrait_size[1] * 0.08,
                portrait_size[0] * 0.82,
                portrait_size[1] * 0.45,
            ),
            fill=(255, 255, 255, 28),
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
        preview = ImageEnhance.Contrast(preview).enhance(1.04)
        preview = ImageEnhance.Sharpness(preview).enhance(1.1)
        return preview.resize((480, 600), Image.Resampling.LANCZOS)

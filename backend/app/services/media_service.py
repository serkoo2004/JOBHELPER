from pathlib import Path
from fastapi import UploadFile
from backend.app.schemas.media import MediaItem


class MediaService:
    PUBLIC_BASE = Path(__file__).resolve().parents[3] / 'frontend' / 'public'

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
    def save_template(cls, file: UploadFile) -> MediaItem:
        template_dir = cls.PUBLIC_BASE / 'templates'
        template_dir.mkdir(parents=True, exist_ok=True)
        destination = template_dir / file.filename
        with destination.open('wb') as buffer:
            buffer.write(file.file.read())
        return MediaItem(name=file.filename, path=f"/templates/{file.filename}")

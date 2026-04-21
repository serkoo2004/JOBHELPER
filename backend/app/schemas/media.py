from typing import Optional

from pydantic import BaseModel


class MediaItem(BaseModel):
    name: str
    path: str


class PhotoStudioRequest(BaseModel):
    photo_path: str
    template: Optional[str] = None
    style: Optional[str] = None


class ProfilePhotoRequest(BaseModel):
    profile_id: str
    photo_path: str


class PhotoDeleteRequest(BaseModel):
    photo_path: str


class PhotoStudioPlacement(BaseModel):
    template: str
    shape: str
    align: str
    size_hint: str
    notes: list[str]


class PhotoStudioResponse(BaseModel):
    original_path: str
    processed_path: str
    preview_path: str
    style: str
    placement: PhotoStudioPlacement
    recommendations: list[str]

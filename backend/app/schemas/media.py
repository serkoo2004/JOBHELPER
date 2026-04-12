from pydantic import BaseModel


class MediaItem(BaseModel):
    name: str
    path: str

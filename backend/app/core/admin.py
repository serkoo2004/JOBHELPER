from fastapi import Header, HTTPException, status

from backend.app.core.config import settings


def require_admin(x_admin_key: str | None = Header(default=None)) -> None:
    configured_key = settings.admin_api_key
    if not configured_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin access is not configured on this environment.",
        )
    if not x_admin_key or x_admin_key != configured_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access denied.",
        )

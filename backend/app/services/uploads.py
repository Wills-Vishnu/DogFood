import secrets
from pathlib import Path

from fastapi import UploadFile

from app.core.config import get_settings
from app.core.errors import PayloadTooLargeError, ValidationFailedError

_CHUNK_SIZE = 64 * 1024


def _detect_image_extension(head: bytes) -> str | None:
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if head.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if head.startswith((b"GIF87a", b"GIF89a")):
        return "gif"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "webp"
    return None


def upload_directory() -> Path:
    path = Path(get_settings().upload_dir)
    path.mkdir(parents=True, exist_ok=True)
    return path


async def save_image(upload: UploadFile) -> str:
    """Stores an image on the local volume and returns its public path. The type is sniffed, never trusted."""
    limit = get_settings().max_upload_bytes
    data = bytearray()
    while chunk := await upload.read(_CHUNK_SIZE):
        data.extend(chunk)
        if len(data) > limit:
            raise PayloadTooLargeError(f"Images must be {limit // (1024 * 1024)} MB or smaller")
    extension = _detect_image_extension(bytes(data[:16]))
    if extension is None:
        raise ValidationFailedError("Only PNG, JPEG, GIF or WebP images are allowed", fields={"file": "Unsupported file type"})
    filename = f"{secrets.token_hex(16)}.{extension}"
    (upload_directory() / filename).write_bytes(bytes(data))
    return f"/uploads/{filename}"

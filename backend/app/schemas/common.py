import re
from datetime import datetime, timezone
from typing import Annotated
from urllib.parse import urlparse

from pydantic import AfterValidator, BaseModel, ConfigDict, PlainSerializer, StringConstraints


def _to_naive_utc(value: datetime) -> datetime:
    if value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


def _serialize_utc(value: datetime) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


# Naive datetimes are interpreted as UTC; aware ones are converted. Output always ends in "Z".
ApiDateTime = Annotated[
    datetime,
    AfterValidator(_to_naive_utc),
    PlainSerializer(_serialize_utc, return_type=str, when_used="json"),
]


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


def text(max_length: int, *, min_length: int = 0):
    return Annotated[str, StringConstraints(strip_whitespace=True, min_length=min_length, max_length=max_length)]


def _empty_to_none(value: str | None) -> str | None:
    return value or None


def optional_text(max_length: int):
    return Annotated[text(max_length) | None, AfterValidator(_empty_to_none)]


def _validate_web_url(value: str | None) -> str | None:
    if not value:
        return None
    parsed = urlparse(value)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError("Must be a valid http:// or https:// URL")
    return value


_UPLOAD_PATH = re.compile(r"^/uploads/[A-Za-z0-9_-]+\.(png|jpg|gif|webp)$")


def _validate_media_url(value: str | None) -> str | None:
    if value and _UPLOAD_PATH.match(value):
        return value
    return _validate_web_url(value)


WebUrl = Annotated[text(500) | None, AfterValidator(_validate_web_url)]
MediaUrl = Annotated[text(500) | None, AfterValidator(_validate_media_url)]

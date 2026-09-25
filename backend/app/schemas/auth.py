import re

from pydantic import BaseModel, Field, field_validator

from app.schemas.common import ApiDateTime, ORMModel, optional_text

# Deliberately permissive: self-hosted installs often use internal domains such as company.local.
_EMAIL_PATTERN = re.compile(r"^[^@\s]{1,64}@[^@\s]+\.[^@\s.]{2,}$")


def _validate_email(value: str) -> str:
    value = value.strip().lower()
    if len(value) > 254 or not _EMAIL_PATTERN.match(value):
        raise ValueError("Enter a valid email address")
    return value


def _clean_display_name(value: str | None) -> str | None:
    if value is None:
        return None
    value = " ".join(value.split())
    if not value:
        raise ValueError("Display name is required")
    return value


class RegisterRequest(BaseModel):
    email: str = Field(max_length=254)
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=1, max_length=100)

    _check_email = field_validator("email")(_validate_email)
    _clean_name = field_validator("display_name")(_clean_display_name)


class LoginRequest(BaseModel):
    email: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=128)


class ProfileUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=100)
    bio: optional_text(500) = None

    _clean_name = field_validator("display_name")(_clean_display_name)


class UserOut(ORMModel):
    id: int
    email: str
    display_name: str
    bio: str | None
    role: str
    created_at: ApiDateTime


class AdminUserOut(UserOut):
    is_active: bool

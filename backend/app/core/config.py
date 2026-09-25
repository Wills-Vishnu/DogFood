import os
from dataclasses import dataclass
from functools import lru_cache

DEFAULT_DATABASE_URL = "mysql+pymysql://dogfood:dogfood@localhost:3306/dogfood?charset=utf8mb4"


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_list(name: str, default: tuple[str, ...]) -> tuple[str, ...]:
    value = os.getenv(name)
    if value is None:
        return default
    return tuple(item.strip() for item in value.split(",") if item.strip())


@dataclass(frozen=True)
class Settings:
    database_url: str
    session_cookie_name: str
    session_ttl_hours: int
    cookie_secure: bool
    allowed_origins: tuple[str, ...]
    upload_dir: str
    max_upload_bytes: int


@lru_cache
def get_settings() -> Settings:
    return Settings(
        database_url=os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL),
        session_cookie_name=os.getenv("SESSION_COOKIE_NAME", "dogfood_session"),
        session_ttl_hours=int(os.getenv("SESSION_TTL_HOURS", "168")),
        cookie_secure=_env_bool("COOKIE_SECURE", False),
        allowed_origins=_env_list(
            "ALLOWED_ORIGINS", ("http://localhost:3000", "http://127.0.0.1:3000")
        ),
        upload_dir=os.getenv("UPLOAD_DIR", "uploads"),
        max_upload_bytes=int(os.getenv("MAX_UPLOAD_BYTES", str(5 * 1024 * 1024))),
    )

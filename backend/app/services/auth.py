from datetime import timedelta

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.clock import utcnow
from app.core.config import get_settings
from app.core.errors import AuthenticationError, ConflictError
from app.core.security import DUMMY_PASSWORD_HASH, hash_password, hash_token, new_token, verify_password
from app.models import Role, User, UserSession
from app.schemas.auth import ProfileUpdate
from app.services.common import commit_or_conflict


def normalize_email(email: str) -> str:
    return email.strip().lower()


def register_user(db: Session, email: str, password: str, display_name: str) -> User:
    email = normalize_email(email)
    if db.scalar(select(User.id).where(User.email == email)) is not None:
        raise ConflictError("An account with this email already exists", code="email_taken", fields={"email": "Already registered"})
    user = User(
        email=email,
        password_hash=hash_password(password),
        display_name=display_name,
        role=Role.PARTICIPANT.value,
    )
    db.add(user)
    commit_or_conflict(db, "An account with this email already exists", code="email_taken")
    return user


def authenticate(db: Session, email: str, password: str) -> User:
    user = db.scalar(select(User).where(User.email == normalize_email(email)))
    if user is None:
        verify_password(password, DUMMY_PASSWORD_HASH)
        raise AuthenticationError("Invalid email or password", code="invalid_credentials")
    if not verify_password(password, user.password_hash) or not user.is_active:
        raise AuthenticationError("Invalid email or password", code="invalid_credentials")
    return user


def create_session(db: Session, user: User) -> str:
    now = utcnow()
    token = new_token()
    db.execute(delete(UserSession).where(UserSession.user_id == user.id, UserSession.expires_at <= now))
    db.add(
        UserSession(
            token_hash=hash_token(token),
            user_id=user.id,
            expires_at=now + timedelta(hours=get_settings().session_ttl_hours),
        )
    )
    db.commit()
    return token


def get_user_for_token(db: Session, token: str) -> User | None:
    session = db.scalar(select(UserSession).where(UserSession.token_hash == hash_token(token)))
    if session is None:
        return None
    if session.expires_at <= utcnow():
        db.delete(session)
        db.commit()
        return None
    if not session.user.is_active:
        return None
    return session.user


def revoke_session(db: Session, token: str) -> None:
    db.execute(delete(UserSession).where(UserSession.token_hash == hash_token(token)))
    db.commit()


def revoke_all_sessions(db: Session, user_id: int) -> None:
    db.execute(delete(UserSession).where(UserSession.user_id == user_id))


def update_profile(db: Session, user: User, data: ProfileUpdate) -> User:
    provided = data.model_fields_set
    if "display_name" in provided and data.display_name is not None:
        user.display_name = data.display_name
    if "bio" in provided:
        user.bio = data.bio
    db.commit()
    return user

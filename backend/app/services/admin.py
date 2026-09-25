from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.clock import utcnow
from app.core.errors import ConflictError, NotFoundError
from app.models import Event, Role, Submission, SubmissionStatus, Team, User
from app.schemas.me import AdminUserUpdate
from app.services.auth import revoke_all_sessions


def list_users(db: Session, *, q: str | None, role: str | None) -> list[User]:
    stmt = select(User).order_by(User.created_at.desc(), User.id.desc())
    if role:
        stmt = stmt.where(User.role == role)
    if q and q.strip():
        pattern = f"%{q.strip().lower()}%"
        stmt = stmt.where(or_(func.lower(User.email).like(pattern), func.lower(User.display_name).like(pattern)))
    return list(db.scalars(stmt.limit(500)))


def update_user(db: Session, admin: User, user_id: int, data: AdminUserUpdate) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise NotFoundError("User not found")
    if user.id == admin.id and (data.role not in (None, Role.ADMIN) or data.is_active is False):
        raise ConflictError("You cannot remove your own admin access", code="self_demotion")
    if data.role is not None:
        user.role = data.role.value
    if data.is_active is not None:
        user.is_active = data.is_active
        if not data.is_active:
            revoke_all_sessions(db, user.id)
    db.commit()
    return user


def overview(db: Session) -> dict:
    now = utcnow()
    users_by_role = {role.value: 0 for role in Role}
    for role, count in db.execute(select(User.role, func.count()).group_by(User.role)):
        users_by_role[role] = count
    return {
        "user_count": sum(users_by_role.values()),
        "users_by_role": users_by_role,
        "event_count": db.scalar(select(func.count()).select_from(Event)),
        "published_event_count": db.scalar(select(func.count()).select_from(Event).where(Event.is_published.is_(True))),
        "active_event_count": db.scalar(
            select(func.count())
            .select_from(Event)
            .where(Event.is_published.is_(True), Event.starts_at <= now, Event.submission_deadline > now)
        ),
        "team_count": db.scalar(select(func.count()).select_from(Team)),
        "submission_count": db.scalar(select(func.count()).select_from(Submission)),
        "submitted_count": db.scalar(
            select(func.count()).select_from(Submission).where(Submission.status == SubmissionStatus.SUBMITTED.value)
        ),
    }

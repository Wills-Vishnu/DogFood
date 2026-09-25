from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.clock import utcnow
from app.core.errors import ConflictError, PermissionDeniedError
from app.models import Event, EventRegistration, Role, TeamMember, User
from app.services.common import commit_or_conflict
from app.services.events import EVENT_LOAD_OPTIONS, registration_is_open


def ensure_participant(user: User) -> None:
    if user.role != Role.PARTICIPANT:
        raise PermissionDeniedError("Only participant accounts can do this", code="participants_only")


def get_registration(db: Session, user_id: int, event_id: int) -> EventRegistration | None:
    return db.scalar(
        select(EventRegistration).where(EventRegistration.user_id == user_id, EventRegistration.event_id == event_id)
    )


def add_registration(db: Session, user: User, event: Event) -> EventRegistration:
    """Stages a registration without committing, enforcing the registration window."""
    if not registration_is_open(event, utcnow()):
        raise ConflictError("Registration is closed for this event", code="registration_closed")
    registration = EventRegistration(event_id=event.id, user_id=user.id)
    db.add(registration)
    return registration


def register(db: Session, user: User, event: Event) -> EventRegistration:
    ensure_participant(user)
    if get_registration(db, user.id, event.id) is not None:
        raise ConflictError("You are already registered for this event", code="already_registered")
    registration = add_registration(db, user, event)
    commit_or_conflict(db, "You are already registered for this event", code="already_registered")
    return registration


def require_registration(db: Session, user: User, event: Event) -> EventRegistration:
    registration = get_registration(db, user.id, event.id)
    if registration is None:
        raise PermissionDeniedError("Register for this event first", code="not_registered")
    return registration


def team_id_for(db: Session, user_id: int, event_id: int) -> int | None:
    return db.scalar(select(TeamMember.team_id).where(TeamMember.user_id == user_id, TeamMember.event_id == event_id))


def list_my_registrations(db: Session, user: User) -> list[EventRegistration]:
    stmt = (
        select(EventRegistration)
        .join(EventRegistration.event)
        .where(EventRegistration.user_id == user.id, Event.is_published.is_(True))
        .options(joinedload(EventRegistration.event).options(*EVENT_LOAD_OPTIONS))
        .order_by(Event.starts_at.desc())
    )
    return list(db.scalars(stmt).unique())


def list_event_registrations(db: Session, event: Event) -> list[EventRegistration]:
    stmt = (
        select(EventRegistration)
        .where(EventRegistration.event_id == event.id)
        .options(joinedload(EventRegistration.user))
        .order_by(EventRegistration.created_at)
    )
    return list(db.scalars(stmt))

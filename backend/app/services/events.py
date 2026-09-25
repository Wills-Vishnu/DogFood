import re
from collections.abc import Sequence
from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.clock import utcnow
from app.core.errors import (
    ConflictError,
    DeadlinePassedError,
    NotFoundError,
    PermissionDeniedError,
    ValidationFailedError,
)
from app.models import (
    Event,
    EventPrize,
    EventRegistration,
    EventTrack,
    Role,
    Submission,
    SubmissionQuestion,
    SubmissionStatus,
    Team,
    User,
)
from app.schemas.events import EventCreate, EventUpdate
from app.services.common import commit_or_conflict

EVENT_LOAD_OPTIONS = (
    selectinload(Event.tracks),
    selectinload(Event.prizes),
    selectinload(Event.questions),
    selectinload(Event.organizer),
)

_SCALAR_FIELDS = (
    "name",
    "slug",
    "description",
    "rules",
    "location",
    "website_url",
    "registration_opens_at",
    "registration_closes_at",
    "starts_at",
    "ends_at",
    "submission_deadline",
    "max_team_size",
)
_NON_NULLABLE_FIELDS = {"name", "slug", "description", "starts_at", "ends_at", "submission_deadline", "max_team_size"}
_TRACK_FIELDS = ("name", "description")
_PRIZE_FIELDS = ("name", "description", "amount")
_QUESTION_FIELDS = ("prompt", "help_text", "is_required", "max_length")
_SLUG_SEPARATORS = re.compile(r"[^a-z0-9]+")


def event_phase(event: Event, now: datetime) -> str:
    if now < event.starts_at:
        return "upcoming"
    if now < event.submission_deadline:
        return "active"
    return "closed"


def registration_is_open(event: Event, now: datetime) -> bool:
    if not event.is_published:
        return False
    if event.registration_opens_at is not None and now < event.registration_opens_at:
        return False
    return now < (event.registration_closes_at or event.submission_deadline)


def submissions_are_open(event: Event, now: datetime) -> bool:
    return now < event.submission_deadline


def ensure_before_deadline(event: Event) -> None:
    """Server-side deadline gate applied to every mutation of team or submission data."""
    if not submissions_are_open(event, utcnow()):
        raise DeadlinePassedError("The submission deadline for this event has passed")


def can_manage_event(user: User | None, event: Event) -> bool:
    if user is None:
        return False
    if user.role == Role.ADMIN:
        return True
    return user.role == Role.ORGANIZER and event.organizer_id == user.id


def get_event(db: Session, event_id: int) -> Event:
    event = db.scalar(select(Event).where(Event.id == event_id).options(*EVENT_LOAD_OPTIONS))
    if event is None:
        raise NotFoundError("Event not found")
    return event


def get_visible_event(db: Session, event_id: int, user: User | None) -> Event:
    event = get_event(db, event_id)
    if not event.is_published and not can_manage_event(user, event):
        raise NotFoundError("Event not found")
    return event


def get_managed_event(db: Session, event_id: int, user: User) -> Event:
    event = get_event(db, event_id)
    if not can_manage_event(user, event):
        raise PermissionDeniedError("You do not manage this event")
    return event


def list_published_events(db: Session) -> list[Event]:
    stmt = (
        select(Event)
        .where(Event.is_published.is_(True))
        .options(*EVENT_LOAD_OPTIONS)
        .order_by(Event.starts_at.desc(), Event.id.desc())
    )
    return list(db.scalars(stmt))


def list_managed_events(db: Session, user: User) -> list[Event]:
    stmt = select(Event).options(*EVENT_LOAD_OPTIONS).order_by(Event.starts_at.desc(), Event.id.desc())
    if user.role != Role.ADMIN:
        stmt = stmt.where(Event.organizer_id == user.id)
    return list(db.scalars(stmt))


def event_counts(db: Session, event_ids: Sequence[int]) -> dict[int, dict[str, int]]:
    counts = {event_id: {"participant_count": 0, "team_count": 0, "submission_count": 0} for event_id in event_ids}
    if not event_ids:
        return counts
    queries = {
        "participant_count": select(EventRegistration.event_id, func.count())
        .where(EventRegistration.event_id.in_(event_ids))
        .group_by(EventRegistration.event_id),
        "team_count": select(Team.event_id, func.count()).where(Team.event_id.in_(event_ids)).group_by(Team.event_id),
        "submission_count": select(Submission.event_id, func.count())
        .where(Submission.event_id.in_(event_ids), Submission.status == SubmissionStatus.SUBMITTED.value)
        .group_by(Submission.event_id),
    }
    for key, stmt in queries.items():
        for event_id, count in db.execute(stmt):
            counts[event_id][key] = count
    return counts


def slugify(value: str) -> str:
    return _SLUG_SEPARATORS.sub("-", value.lower()).strip("-")[:100] or "event"


def _slug_taken(db: Session, slug: str, exclude_id: int | None = None) -> bool:
    stmt = select(Event.id).where(Event.slug == slug)
    if exclude_id is not None:
        stmt = stmt.where(Event.id != exclude_id)
    return db.scalar(stmt) is not None


def _unique_slug(db: Session, base: str) -> str:
    candidate, suffix = base, 2
    while _slug_taken(db, candidate):
        candidate = f"{base}-{suffix}"
        suffix += 1
    return candidate


def _validate_schedule(event: Event) -> None:
    errors: dict[str, str] = {}
    if event.ends_at <= event.starts_at:
        errors["ends_at"] = "The event must end after it starts"
    if not event.starts_at < event.submission_deadline <= event.ends_at:
        errors["submission_deadline"] = "The deadline must be after the start and no later than the end"
    opens, closes = event.registration_opens_at, event.registration_closes_at
    if opens is not None and closes is not None and closes <= opens:
        errors["registration_closes_at"] = "Registration must close after it opens"
    elif closes is not None and closes > event.submission_deadline:
        errors["registration_closes_at"] = "Registration must close by the submission deadline"
    if errors:
        raise ValidationFailedError("The event schedule is invalid", fields=errors)


def _ensure_unique_track_names(tracks: Sequence[BaseModel]) -> None:
    seen: set[str] = set()
    for track in tracks:
        key = track.name.lower()
        if key in seen:
            raise ValidationFailedError(f"Track names must be unique ({track.name})", fields={"tracks": "Track names must be unique"})
        seen.add(key)


def _sync_children(db: Session, event: Event, attribute: str, incoming: Sequence[BaseModel], model: type, fields: tuple[str, ...]) -> None:
    collection = getattr(event, attribute)
    existing = {item.id: item for item in collection}
    keep_ids = {data.id for data in incoming if data.id is not None}
    unknown = keep_ids - existing.keys()
    if unknown:
        raise ValidationFailedError(f"Unknown {attribute} id {min(unknown)}", fields={attribute: "Contains an unknown id"})
    for item in [item for item in collection if item.id not in keep_ids]:
        collection.remove(item)
    # Deletions are flushed first so a removed name can be reused in the same request.
    db.flush()
    ordered = []
    for position, data in enumerate(incoming):
        item = existing[data.id] if data.id is not None else model()
        for field in fields:
            setattr(item, field, getattr(data, field))
        item.sort_order = position
        ordered.append(item)
    setattr(event, attribute, ordered)


def create_event(db: Session, organizer: User, data: EventCreate) -> Event:
    _ensure_unique_track_names(data.tracks)
    if data.slug is not None and _slug_taken(db, data.slug):
        raise ConflictError("That slug is already in use", code="slug_taken", fields={"slug": "Already in use"})
    event = Event(
        name=data.name,
        slug=data.slug or _unique_slug(db, slugify(data.name)),
        description=data.description,
        rules=data.rules,
        location=data.location,
        website_url=data.website_url,
        registration_opens_at=data.registration_opens_at,
        registration_closes_at=data.registration_closes_at,
        starts_at=data.starts_at,
        ends_at=data.ends_at,
        submission_deadline=data.submission_deadline,
        max_team_size=data.max_team_size,
        is_published=data.is_published,
        published_at=utcnow() if data.is_published else None,
        organizer_id=organizer.id,
    )
    _validate_schedule(event)
    event.tracks = [
        EventTrack(name=t.name, description=t.description, sort_order=i) for i, t in enumerate(data.tracks)
    ]
    event.prizes = [
        EventPrize(name=p.name, description=p.description, amount=p.amount, sort_order=i)
        for i, p in enumerate(data.prizes)
    ]
    event.questions = [
        SubmissionQuestion(
            prompt=q.prompt, help_text=q.help_text, is_required=q.is_required, max_length=q.max_length, sort_order=i
        )
        for i, q in enumerate(data.questions)
    ]
    db.add(event)
    commit_or_conflict(db, "The event could not be saved because of a conflicting value", code="event_conflict")
    return get_event(db, event.id)


def update_event(db: Session, event: Event, data: EventUpdate) -> Event:
    provided = data.model_fields_set
    for field in _SCALAR_FIELDS:
        if field not in provided:
            continue
        value = getattr(data, field)
        if value is None and field in _NON_NULLABLE_FIELDS:
            raise ValidationFailedError("A required field was cleared", fields={field: "This field is required"})
        if field == "slug" and _slug_taken(db, value, exclude_id=event.id):
            raise ConflictError("That slug is already in use", code="slug_taken", fields={"slug": "Already in use"})
        setattr(event, field, value)
    if "is_published" in provided and data.is_published is not None:
        if data.is_published and not event.is_published:
            event.published_at = utcnow()
        event.is_published = data.is_published
    _validate_schedule(event)

    if data.tracks is not None:
        _ensure_unique_track_names(data.tracks)
        _sync_children(db, event, "tracks", data.tracks, EventTrack, _TRACK_FIELDS)
    if data.prizes is not None:
        _sync_children(db, event, "prizes", data.prizes, EventPrize, _PRIZE_FIELDS)
    if data.questions is not None:
        _sync_children(db, event, "questions", data.questions, SubmissionQuestion, _QUESTION_FIELDS)

    event.updated_at = utcnow()
    commit_or_conflict(db, "The event could not be saved because of a conflicting value", code="event_conflict")
    return get_event(db, event.id)

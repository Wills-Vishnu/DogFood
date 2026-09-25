from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.errors import NotFoundError
from app.models import Event, EventTrack, Submission, SubmissionStatus, SubmissionTag, Team

_CARD_LOAD_OPTIONS = (
    joinedload(Submission.event),
    joinedload(Submission.team),
    joinedload(Submission.track),
    selectinload(Submission.tags),
)
_SORTS = {
    "newest": (Submission.submitted_at.desc(), Submission.id.desc()),
    "oldest": (Submission.submitted_at.asc(), Submission.id.asc()),
    "title": (Submission.title.asc(), Submission.id.asc()),
}


def _public_submissions() -> Select:
    """Only submitted projects in published events are ever visible to the public."""
    return (
        select(Submission)
        .join(Submission.event)
        .where(Submission.status == SubmissionStatus.SUBMITTED.value, Event.is_published.is_(True))
    )


def _like_pattern(term: str) -> str:
    escaped = term.replace("!", "!!").replace("%", "!%").replace("_", "!_")
    return f"%{escaped}%"


def search_projects(
    db: Session,
    *,
    q: str | None,
    event_id: int | None,
    track_id: int | None,
    tag: str | None,
    sort: str,
    page: int,
    page_size: int,
) -> tuple[list[Submission], int]:
    stmt = _public_submissions()
    if event_id is not None:
        stmt = stmt.where(Submission.event_id == event_id)
    if track_id is not None:
        stmt = stmt.where(Submission.track_id == track_id)
    if tag:
        stmt = stmt.where(Submission.tags.any(func.lower(SubmissionTag.tag) == tag.strip().lower()))
    if q and q.strip():
        pattern = _like_pattern(q.strip())
        stmt = stmt.where(
            or_(
                Submission.title.ilike(pattern, escape="!"),
                Submission.tagline.ilike(pattern, escape="!"),
                Submission.description.ilike(pattern, escape="!"),
                Submission.tags.any(SubmissionTag.tag.ilike(pattern, escape="!")),
                Submission.track.has(EventTrack.name.ilike(pattern, escape="!")),
                Submission.team.has(Team.name.ilike(pattern, escape="!")),
            )
        )
    total = db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery()))
    items = db.scalars(
        stmt.options(*_CARD_LOAD_OPTIONS)
        .order_by(*_SORTS.get(sort, _SORTS["newest"]))
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).unique()
    return list(items), total


def get_public_project(db: Session, submission_id: int) -> Submission:
    submission = db.scalar(
        _public_submissions()
        .where(Submission.id == submission_id)
        .options(
            *_CARD_LOAD_OPTIONS,
            selectinload(Submission.images),
            joinedload(Submission.team).selectinload(Team.members),
        )
    )
    if submission is None:
        raise NotFoundError("Project not found")
    return submission


def gallery_filters(db: Session, event_id: int | None) -> tuple[list[Event], list[EventTrack], list[str]]:
    public = _public_submissions().subquery()
    events = list(
        db.scalars(
            select(Event).where(Event.id.in_(select(public.c.event_id))).order_by(Event.starts_at.desc())
        )
    )
    track_stmt = select(EventTrack).where(EventTrack.id.in_(select(public.c.track_id)))
    if event_id is not None:
        track_stmt = track_stmt.where(EventTrack.event_id == event_id)
    tracks = list(db.scalars(track_stmt.order_by(EventTrack.event_id, EventTrack.sort_order)))

    tag_stmt = select(SubmissionTag.tag).where(SubmissionTag.submission_id.in_(select(public.c.id)))
    if event_id is not None:
        tag_stmt = tag_stmt.where(SubmissionTag.submission_id.in_(select(public.c.id).where(public.c.event_id == event_id)))
    counts: dict[str, tuple[str, int]] = {}
    for (tag,) in db.execute(tag_stmt):
        key = tag.lower()
        label, count = counts.get(key, (tag, 0))
        counts[key] = (label, count + 1)
    tags = [label for label, _ in sorted(counts.values(), key=lambda item: (-item[1], item[0].lower()))][:50]
    return events, tracks, tags

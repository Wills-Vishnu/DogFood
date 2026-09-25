from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.clock import utcnow
from app.core.errors import ConflictError, NotFoundError, PermissionDeniedError, ValidationFailedError
from app.models import (
    Event,
    Submission,
    SubmissionAnswer,
    SubmissionImage,
    SubmissionStatus,
    SubmissionTag,
    Team,
    User,
)
from app.schemas.submissions import SubmissionUpdate
from app.services.common import commit_or_conflict
from app.services.events import can_manage_event, ensure_before_deadline, submissions_are_open
from app.services.teams import is_member, require_member

SUBMISSION_LOAD_OPTIONS = (
    joinedload(Submission.event).options(selectinload(Event.tracks), selectinload(Event.questions)),
    joinedload(Submission.team).selectinload(Team.members),
    joinedload(Submission.track),
    selectinload(Submission.images),
    selectinload(Submission.tags),
    selectinload(Submission.answers),
)

_TEXT_FIELDS = ("title", "tagline", "description")
_URL_FIELDS = ("thumbnail_url", "demo_video_url", "repo_url", "live_url")


def submission_state(submission: Submission, now: datetime) -> str:
    closed = not submissions_are_open(submission.event, now)
    if submission.status == SubmissionStatus.SUBMITTED:
        return "locked" if closed else "submitted"
    return "closed" if closed else "draft"


def missing_fields(submission: Submission) -> dict[str, str]:
    """Fields that must be filled before the submission can be (or remain) submitted."""
    missing: dict[str, str] = {}
    if not submission.title.strip():
        missing["title"] = "Project name is required"
    if not submission.tagline.strip():
        missing["tagline"] = "Tagline is required"
    if not submission.description.strip():
        missing["description"] = "Description is required"
    if submission.event.tracks and submission.track_id is None:
        missing["track_id"] = "Select a track"
    answers = {answer.question_id: answer.answer for answer in submission.answers}
    for question in submission.event.questions:
        if question.is_required and not answers.get(question.id, "").strip():
            missing[f"answers.{question.id}"] = "This question is required"
    return missing


def get_submission(db: Session, submission_id: int) -> Submission:
    submission = db.scalar(
        select(Submission).where(Submission.id == submission_id).options(*SUBMISSION_LOAD_OPTIONS)
    )
    if submission is None:
        raise NotFoundError("Submission not found")
    return submission


def get_submission_for_viewer(db: Session, submission_id: int, user: User) -> Submission:
    submission = get_submission(db, submission_id)
    if not is_member(submission.team, user.id) and not can_manage_event(user, submission.event):
        raise PermissionDeniedError("You do not have access to this submission", code="not_team_member")
    return submission


def get_team_submission(db: Session, team: Team) -> Submission | None:
    submission_id = db.scalar(select(Submission.id).where(Submission.team_id == team.id))
    return get_submission(db, submission_id) if submission_id is not None else None


def list_event_submissions(db: Session, event: Event) -> list[Submission]:
    stmt = (
        select(Submission)
        .where(Submission.event_id == event.id)
        .options(*SUBMISSION_LOAD_OPTIONS)
        .order_by(Submission.updated_at.desc())
    )
    return list(db.scalars(stmt).unique())


def create_submission(db: Session, team: Team, user: User) -> Submission:
    require_member(team, user)
    ensure_before_deadline(team.event)
    if get_team_submission(db, team) is not None:
        raise ConflictError("Your team already has a submission", code="submission_exists")
    submission = Submission(event_id=team.event_id, team_id=team.id, status=SubmissionStatus.DRAFT.value)
    db.add(submission)
    commit_or_conflict(db, "Your team already has a submission", code="submission_exists")
    return get_submission(db, submission.id)


def _normalize_tags(tags: list[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    for raw in tags:
        tag = " ".join(raw.split())[:50]
        if tag and tag.lower() not in seen:
            seen.add(tag.lower())
            result.append(tag)
    return result


def _apply_tags(submission: Submission, tags: list[str]) -> None:
    # Matching existing rows case-insensitively avoids delete+insert collisions on the unique index.
    existing = {item.tag.lower(): item for item in submission.tags}
    updated = []
    for tag in _normalize_tags(tags):
        item = existing.get(tag.lower()) or SubmissionTag(tag=tag)
        item.tag = tag
        updated.append(item)
    submission.tags = updated


def _apply_answers(submission: Submission, answers) -> None:
    questions = {question.id: question for question in submission.event.questions}
    existing = {answer.question_id: answer for answer in submission.answers}
    for item in answers:
        question = questions.get(item.question_id)
        if question is None:
            raise ValidationFailedError(
                "Unknown question", fields={f"answers.{item.question_id}": "This question does not belong to the event"}
            )
        text = item.answer.strip()
        if len(text) > question.max_length:
            raise ValidationFailedError(
                "Answer is too long",
                fields={f"answers.{question.id}": f"Keep this answer under {question.max_length} characters"},
            )
        current = existing.get(question.id)
        if not text:
            if current is not None:
                submission.answers.remove(current)
        elif current is not None:
            current.answer = text
        else:
            submission.answers.append(SubmissionAnswer(question_id=question.id, answer=text))


def update_submission(db: Session, submission: Submission, user: User, data: SubmissionUpdate) -> Submission:
    require_member(submission.team, user)
    ensure_before_deadline(submission.event)
    provided = data.model_fields_set

    for field in _TEXT_FIELDS:
        if field in provided:
            setattr(submission, field, getattr(data, field) or "")
    for field in _URL_FIELDS:
        if field in provided:
            setattr(submission, field, getattr(data, field))
    if "track_id" in provided:
        if data.track_id is not None and data.track_id not in {track.id for track in submission.event.tracks}:
            raise ValidationFailedError("Unknown track", fields={"track_id": "Choose one of this event's tracks"})
        submission.track_id = data.track_id
    if "tags" in provided and data.tags is not None:
        _apply_tags(submission, data.tags)
    if "images" in provided and data.images is not None:
        urls = [url for url in data.images if url]
        submission.images = [SubmissionImage(url=url, sort_order=i) for i, url in enumerate(urls)]
    if "answers" in provided and data.answers is not None:
        _apply_answers(submission, data.answers)

    if submission.status == SubmissionStatus.SUBMITTED:
        missing = missing_fields(submission)
        if missing:
            raise ValidationFailedError("A submitted project must keep all required fields", fields=missing)

    submission.updated_at = utcnow()
    commit_or_conflict(db, "The submission could not be saved", code="submission_conflict")
    db.expire_all()
    return get_submission(db, submission.id)


def submit_submission(db: Session, submission: Submission, user: User) -> Submission:
    require_member(submission.team, user)
    ensure_before_deadline(submission.event)
    if submission.status == SubmissionStatus.SUBMITTED:
        return submission
    missing = missing_fields(submission)
    if missing:
        raise ValidationFailedError("Complete the required fields before submitting", fields=missing)
    now = utcnow()
    submission.status = SubmissionStatus.SUBMITTED.value
    submission.submitted_at = now
    submission.updated_at = now
    db.commit()
    return get_submission(db, submission.id)

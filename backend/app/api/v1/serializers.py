"""Builds API response models from ORM objects plus computed, time-dependent state."""

from datetime import datetime

from sqlalchemy.orm import Session

from app.core.clock import utcnow
from app.models import Event, Submission, Team, TeamInvitation
from app.schemas.events import EventOut, PersonOut, PrizeOut, QuestionOut, TrackOut
from app.schemas.gallery import NamedRef, ProjectCardOut, ProjectDetailOut, PublicTeamOut
from app.schemas.submissions import AnswerOut, SubmissionOut, SubmissionRowOut
from app.schemas.teams import InvitationOut, TeamMemberOut, TeamOut, TeamSubmissionSummary
from app.services.events import event_counts, event_phase, registration_is_open, submissions_are_open
from app.services.submissions import missing_fields, submission_state


def event_out(event: Event, counts: dict[str, int], now: datetime) -> EventOut:
    return EventOut(
        id=event.id,
        slug=event.slug,
        name=event.name,
        description=event.description,
        rules=event.rules,
        location=event.location,
        website_url=event.website_url,
        registration_opens_at=event.registration_opens_at,
        registration_closes_at=event.registration_closes_at,
        starts_at=event.starts_at,
        ends_at=event.ends_at,
        submission_deadline=event.submission_deadline,
        max_team_size=event.max_team_size,
        is_published=event.is_published,
        published_at=event.published_at,
        phase=event_phase(event, now),
        registration_open=registration_is_open(event, now),
        submissions_open=submissions_are_open(event, now),
        tracks=[TrackOut.model_validate(track) for track in event.tracks],
        prizes=[PrizeOut.model_validate(prize) for prize in event.prizes],
        questions=[QuestionOut.model_validate(question) for question in event.questions],
        organizer=PersonOut(id=event.organizer.id, display_name=event.organizer.display_name),
        server_time=now,
        created_at=event.created_at,
        updated_at=event.updated_at,
        **counts,
    )


def events_out(db: Session, events: list[Event]) -> list[EventOut]:
    now = utcnow()
    counts = event_counts(db, [event.id for event in events])
    return [event_out(event, counts[event.id], now) for event in events]


def submission_summary(submission: Submission | None, now: datetime) -> TeamSubmissionSummary | None:
    if submission is None:
        return None
    return TeamSubmissionSummary(
        id=submission.id,
        title=submission.title,
        status=submission.status,
        state=submission_state(submission, now),
        submitted_at=submission.submitted_at,
        updated_at=submission.updated_at,
    )


def team_out(team: Team, now: datetime | None = None) -> TeamOut:
    now = now or utcnow()
    return TeamOut(
        id=team.id,
        event_id=team.event_id,
        event_name=team.event.name,
        name=team.name,
        captain_id=team.captain_id,
        max_team_size=team.event.max_team_size,
        members=[
            TeamMemberOut(
                user_id=member.user_id,
                display_name=member.user.display_name,
                email=member.user.email,
                is_captain=member.user_id == team.captain_id,
                joined_at=member.joined_at,
            )
            for member in team.members
        ],
        submission=submission_summary(team.submission, now),
        created_at=team.created_at,
    )


def invitation_out(invitation: TeamInvitation, now: datetime) -> InvitationOut:
    return InvitationOut(
        id=invitation.id,
        status=invitation.status(now),
        created_at=invitation.created_at,
        expires_at=invitation.expires_at,
        created_by_name=invitation.created_by.display_name if invitation.created_by else None,
        accepted_by_name=invitation.accepted_by.display_name if invitation.accepted_by else None,
        accepted_at=invitation.accepted_at,
    )


def submission_out(submission: Submission) -> SubmissionOut:
    now = utcnow()
    state = submission_state(submission, now)
    return SubmissionOut(
        id=submission.id,
        event_id=submission.event_id,
        event_name=submission.event.name,
        team_id=submission.team_id,
        team_name=submission.team.name,
        title=submission.title,
        tagline=submission.tagline,
        description=submission.description,
        thumbnail_url=submission.thumbnail_url,
        demo_video_url=submission.demo_video_url,
        repo_url=submission.repo_url,
        live_url=submission.live_url,
        track_id=submission.track_id,
        track_name=submission.track.name if submission.track else None,
        tags=[item.tag for item in submission.tags],
        images=[item.url for item in submission.images],
        answers=[AnswerOut(question_id=item.question_id, answer=item.answer) for item in submission.answers],
        status=submission.status,
        state=state,
        is_editable=state in ("draft", "submitted"),
        deadline=submission.event.submission_deadline,
        server_time=now,
        missing_fields=missing_fields(submission),
        submitted_at=submission.submitted_at,
        created_at=submission.created_at,
        updated_at=submission.updated_at,
    )


def submission_row_out(submission: Submission, now: datetime) -> SubmissionRowOut:
    return SubmissionRowOut(
        id=submission.id,
        title=submission.title,
        team_id=submission.team_id,
        team_name=submission.team.name,
        track_name=submission.track.name if submission.track else None,
        status=submission.status,
        state=submission_state(submission, now),
        submitted_at=submission.submitted_at,
        updated_at=submission.updated_at,
    )


def project_card_out(submission: Submission) -> ProjectCardOut:
    return ProjectCardOut(
        id=submission.id,
        title=submission.title,
        tagline=submission.tagline,
        thumbnail_url=submission.thumbnail_url,
        tags=[item.tag for item in submission.tags],
        track_name=submission.track.name if submission.track else None,
        team_name=submission.team.name,
        event_id=submission.event_id,
        event_name=submission.event.name,
        submitted_at=submission.submitted_at,
    )


def project_detail_out(submission: Submission) -> ProjectDetailOut:
    # Public view: display names only, never emails, answers, or draft data.
    return ProjectDetailOut(
        id=submission.id,
        title=submission.title,
        tagline=submission.tagline,
        description=submission.description,
        thumbnail_url=submission.thumbnail_url,
        images=[item.url for item in submission.images],
        demo_video_url=submission.demo_video_url,
        repo_url=submission.repo_url,
        live_url=submission.live_url,
        tags=[item.tag for item in submission.tags],
        track=NamedRef(id=submission.track.id, name=submission.track.name) if submission.track else None,
        team=PublicTeamOut(
            name=submission.team.name,
            members=[member.user.display_name for member in submission.team.members],
        ),
        event=NamedRef(id=submission.event.id, name=submission.event.name),
        submitted_at=submission.submitted_at,
    )

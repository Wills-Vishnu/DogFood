"""Deterministic development seed data. Idempotent: records are keyed by email/slug and never duplicated."""

from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.clock import utcnow
from app.core.security import hash_password, hash_token
from app.db.session import get_session_factory
from app.models import (
    Event,
    EventPrize,
    EventRegistration,
    EventTrack,
    Role,
    Submission,
    SubmissionAnswer,
    SubmissionQuestion,
    SubmissionStatus,
    SubmissionTag,
    Team,
    TeamInvitation,
    TeamMember,
    User,
)

PARTICIPANT_PASSWORD = "DogfoodParticipant1!"
SEED_USERS = {
    "admin": ("admin@dogfood.local", "Alex Admin", Role.ADMIN, "DogfoodAdmin1!"),
    "organizer": ("organizer@dogfood.local", "Jordan Organizer", Role.ORGANIZER, "DogfoodOrganizer1!"),
    "judge": ("judge@dogfood.local", "Casey Judge", Role.JUDGE, "DogfoodJudge1!"),
    "riley": ("riley@dogfood.local", "Riley Participant", Role.PARTICIPANT, PARTICIPANT_PASSWORD),
    "avery": ("avery@dogfood.local", "Avery Developer", Role.PARTICIPANT, PARTICIPANT_PASSWORD),
    "sam": ("sam@dogfood.local", "Sam Builder", Role.PARTICIPANT, PARTICIPANT_PASSWORD),
    "jamie": ("jamie@dogfood.local", "Jamie Newcomer", Role.PARTICIPANT, PARTICIPANT_PASSWORD),
}
ACTIVE_INVITE_TOKEN = "seed-chainforge-invite-token"
EXPIRED_INVITE_TOKEN = "seed-neuralflux-expired-token"


def _user(db: Session, email: str, name: str, role: Role, password: str) -> User:
    user = db.scalar(select(User).where(User.email == email))
    if user is None:
        user = User(email=email, display_name=name, role=role.value, password_hash=hash_password(password))
        db.add(user)
        db.flush()
    return user


def _new_event(db: Session, slug: str, organizer: User, **fields) -> Event | None:
    if db.scalar(select(Event.id).where(Event.slug == slug)) is not None:
        return None
    event = Event(slug=slug, organizer_id=organizer.id, **fields)
    db.add(event)
    db.flush()
    return event


def _register(db: Session, event: Event, *users: User) -> None:
    for user in users:
        db.add(EventRegistration(event_id=event.id, user_id=user.id))


def _team(db: Session, event: Event, name: str, captain: User, *members: User) -> Team:
    team = Team(event_id=event.id, name=name, captain_id=captain.id)
    team.members = [TeamMember(event_id=event.id, user_id=user.id) for user in (captain, *members)]
    db.add(team)
    db.flush()
    return team


def _submission(db: Session, team: Team, *, submitted_at: datetime | None, tags: list[str], **fields) -> Submission:
    submission = Submission(
        event_id=team.event_id,
        team_id=team.id,
        status=SubmissionStatus.SUBMITTED.value if submitted_at else SubmissionStatus.DRAFT.value,
        submitted_at=submitted_at,
        **fields,
    )
    submission.tags = [SubmissionTag(tag=tag) for tag in tags]
    db.add(submission)
    db.flush()
    return submission


def _seed_techhacks(db: Session, users: dict[str, User], now: datetime) -> None:
    event = _new_event(
        db,
        "techhacks-2026",
        users["organizer"],
        name="TechHacks 2026",
        description=(
            "TechHacks 2026 brings builders, designers and innovators together to create solutions across "
            "AI, Web3 and HealthTech. Form a team, build something ambitious and ship it before the deadline."
        ),
        rules="Teams of up to 4 people. All code must be written during the hackathon. Submit before the deadline.",
        location="San Francisco, CA",
        starts_at=now - timedelta(days=2),
        ends_at=now + timedelta(days=15),
        submission_deadline=now + timedelta(days=14),
        max_team_size=4,
        is_published=True,
        published_at=now - timedelta(days=10),
    )
    if event is None:
        return
    ai, web3, _health = event.tracks = [
        EventTrack(name="AI & Machine Learning", description="Intelligent systems and applied ML", sort_order=0),
        EventTrack(name="Web3 & Blockchain", description="Decentralised apps and protocols", sort_order=1),
        EventTrack(name="HealthTech", description="Technology for better health outcomes", sort_order=2),
    ]
    event.prizes = [
        EventPrize(name="Grand Prize", amount=5000, sort_order=0),
        EventPrize(name="Runner-up", amount=2000, sort_order=1),
        EventPrize(name="Best Design", description="Most polished user experience", amount=1000, sort_order=2),
    ]
    problem, _sponsors = event.questions = [
        SubmissionQuestion(prompt="What problem does your project solve?", is_required=True, sort_order=0),
        SubmissionQuestion(prompt="Which sponsor APIs or tools did you use?", is_required=False, sort_order=1),
    ]
    db.flush()
    _register(db, event, users["riley"], users["avery"], users["sam"], users["jamie"])

    neural_flux = _team(db, event, "Neural Flux", users["riley"], users["avery"])
    mindflow = _submission(
        db,
        neural_flux,
        submitted_at=now - timedelta(hours=6),
        tags=["Python", "TensorFlow", "React"],
        title="MindFlow: AI-Powered Learning Assistant",
        tagline="An AI tutor that adapts to your learning style and pace",
        description=(
            "MindFlow observes how you study and adapts explanations, pacing and practice problems in real time. "
            "It combines a lightweight on-device model with spaced repetition to keep learners in their flow zone."
        ),
        repo_url="https://github.com/example/mindflow",
        live_url="https://mindflow.example.com",
        demo_video_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        track_id=ai.id,
    )
    mindflow.answers = [
        SubmissionAnswer(question_id=problem.id, answer="Students lose motivation when material is too hard or too easy."),
    ]
    db.add(
        TeamInvitation(
            team_id=neural_flux.id,
            token_hash=hash_token(EXPIRED_INVITE_TOKEN),
            created_by_id=users["riley"].id,
            created_at=now - timedelta(days=5),
            expires_at=now - timedelta(days=2),
        )
    )

    chainforge = _team(db, event, "ChainForge", users["sam"])
    _submission(
        db,
        chainforge,
        submitted_at=None,
        tags=["Solidity", "TypeScript"],
        title="LedgerLink: Interoperable Chain Bridge",
        tagline="Seamless asset transfer across blockchain networks",
        description="Work in progress: a protocol for moving assets between chains without custodians.",
        track_id=web3.id,
    )
    db.add(
        TeamInvitation(
            team_id=chainforge.id,
            token_hash=hash_token(ACTIVE_INVITE_TOKEN),
            created_by_id=users["sam"].id,
            expires_at=now + timedelta(days=7),
        )
    )


def _seed_winter_build(db: Session, users: dict[str, User], now: datetime) -> None:
    event = _new_event(
        db,
        "winter-build-2026",
        users["organizer"],
        name="Winter Build 2026",
        description="A weekend build sprint focused on productivity tools. Submissions are closed.",
        location="Online",
        starts_at=now - timedelta(days=40),
        ends_at=now - timedelta(days=30),
        submission_deadline=now - timedelta(days=30),
        max_team_size=3,
        is_published=True,
        published_at=now - timedelta(days=50),
    )
    if event is None:
        return
    (track,) = event.tracks = [EventTrack(name="Open Innovation", sort_order=0)]
    event.prizes = [EventPrize(name="Best Overall", amount=1500, sort_order=0)]
    db.flush()
    _register(db, event, users["avery"])
    team = _team(db, event, "Night Owls", users["avery"])
    _submission(
        db,
        team,
        submitted_at=now - timedelta(days=31),
        tags=["Flutter", "Dart", "SQLite"],
        title="Pocket Planner",
        tagline="Offline-first weekly planning that syncs when you are ready",
        description="Pocket Planner keeps your week organised without an account or a network connection.",
        repo_url="https://github.com/example/pocket-planner",
        track_id=track.id,
    )


def _seed_draft_event(db: Session, users: dict[str, User], now: datetime) -> None:
    event = _new_event(
        db,
        "spring-sprint-2027",
        users["organizer"],
        name="Spring Sprint 2027",
        description="Unpublished draft event used to verify visibility rules.",
        starts_at=now + timedelta(days=60),
        ends_at=now + timedelta(days=62),
        submission_deadline=now + timedelta(days=62),
        is_published=False,
    )
    if event is not None:
        event.tracks = [EventTrack(name="Climate", sort_order=0)]


def seed(db: Session) -> None:
    now = utcnow()
    users = {key: _user(db, *values) for key, values in SEED_USERS.items()}
    _seed_techhacks(db, users, now)
    _seed_winter_build(db, users, now)
    _seed_draft_event(db, users, now)
    db.commit()


def main() -> None:
    with get_session_factory()() as db:
        seed(db)
    print("Seed data is in place", flush=True)


if __name__ == "__main__":
    main()

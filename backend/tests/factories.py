from datetime import timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.clock import utcnow
from app.core.security import hash_password
from app.models import Event, EventTrack, Role, SubmissionQuestion, User

PASSWORD = "CorrectHorse1!"
_PASSWORD_HASH = hash_password(PASSWORD)
API = "/api/v1"


def create_user(db: Session, email: str, role: Role = Role.PARTICIPANT, name: str | None = None) -> User:
    user = User(
        email=email,
        display_name=name or email.split("@")[0].title(),
        role=role.value,
        password_hash=_PASSWORD_HASH,
    )
    db.add(user)
    db.commit()
    return user


def create_event(
    db: Session,
    organizer: User,
    *,
    name: str = "Test Hack",
    slug: str | None = None,
    published: bool = True,
    deadline_in: timedelta = timedelta(days=7),
    max_team_size: int = 4,
    tracks: tuple[str, ...] = ("AI", "Web"),
    required_question: bool = True,
) -> Event:
    now = utcnow()
    event = Event(
        name=name,
        slug=slug or name.lower().replace(" ", "-"),
        description=f"{name} description",
        starts_at=now - timedelta(days=1),
        submission_deadline=now + deadline_in,
        ends_at=now + deadline_in + timedelta(hours=1),
        max_team_size=max_team_size,
        is_published=published,
        published_at=now if published else None,
        organizer_id=organizer.id,
    )
    event.tracks = [EventTrack(name=track, sort_order=i) for i, track in enumerate(tracks)]
    event.questions = [
        SubmissionQuestion(prompt="What problem does it solve?", is_required=required_question, sort_order=0)
    ]
    db.add(event)
    db.commit()
    return event


def close_submissions(db: Session, event: Event) -> None:
    """Moves the deadline into the past directly in the database, as the passage of time would."""
    now = utcnow()
    event.starts_at = now - timedelta(days=3)
    event.submission_deadline = now - timedelta(minutes=1)
    event.ends_at = now - timedelta(minutes=1)
    db.commit()


def register(client: TestClient, event_id: int) -> None:
    response = client.post(f"{API}/events/{event_id}/registration")
    assert response.status_code == 201, response.text


def create_team(client: TestClient, event_id: int, name: str = "Rocket") -> dict:
    register(client, event_id)
    response = client.post(f"{API}/events/{event_id}/teams", json={"name": name})
    assert response.status_code == 201, response.text
    return response.json()


def invite_token(client: TestClient, team_id: int) -> str:
    response = client.post(f"{API}/teams/{team_id}/invitations", json={})
    assert response.status_code == 201, response.text
    return response.json()["token"]


def create_draft(client: TestClient, team_id: int) -> dict:
    response = client.post(f"{API}/teams/{team_id}/submission")
    assert response.status_code == 201, response.text
    return response.json()


def complete_payload(event: Event) -> dict:
    return {
        "title": "Solar Scout",
        "tagline": "Find the sunniest rooftops",
        "description": "Maps rooftop solar potential using open data.",
        "track_id": event.tracks[0].id,
        "tags": ["Python", "React"],
        "repo_url": "https://github.com/example/solar-scout",
        "answers": [{"question_id": event.questions[0].id, "answer": "Solar adoption is slow"}],
    }


def submit_project(client: TestClient, event: Event, team_id: int, **overrides) -> dict:
    draft = create_draft(client, team_id)
    payload = {**complete_payload(event), **overrides}
    response = client.patch(f"{API}/submissions/{draft['id']}", json=payload)
    assert response.status_code == 200, response.text
    response = client.post(f"{API}/submissions/{draft['id']}/submit")
    assert response.status_code == 200, response.text
    return response.json()


def error_code(response) -> str:
    return response.json()["error"]["code"]

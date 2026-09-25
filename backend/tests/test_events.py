from datetime import datetime, timedelta

from app.core.clock import utcnow
from tests.factories import API, create_event, error_code


def _iso(delta: timedelta, base: datetime | None = None) -> str:
    return ((base or utcnow()) + delta).isoformat() + "Z"


def _payload(**overrides) -> dict:
    # One clock reading: separate utcnow() calls differ by microseconds on Linux, which would put
    # submission_deadline just after ends_at instead of exactly at it.
    now = utcnow()
    payload = {
        "name": "Build Week 2030",
        "description": "Ship something",
        "starts_at": _iso(timedelta(days=1), now),
        "ends_at": _iso(timedelta(days=3), now),
        "submission_deadline": _iso(timedelta(days=3), now),
        "tracks": [{"name": "AI"}, {"name": "Climate", "description": "Planet first"}],
        "prizes": [{"name": "Grand", "amount": 1000}, {"name": "Community"}],
        "questions": [{"prompt": "Why this?", "is_required": True}],
    }
    return {**payload, **overrides}


def test_organizer_creates_event_with_tracks_prizes_and_questions(login_as):
    organizer = login_as("organizer")
    response = organizer.post(f"{API}/events", json=_payload())
    assert response.status_code == 201, response.text
    event = response.json()
    assert event["slug"] == "build-week-2030"
    assert event["is_published"] is False
    assert [track["name"] for track in event["tracks"]] == ["AI", "Climate"]
    assert [prize["amount"] for prize in event["prizes"]] == [1000, None]
    assert event["questions"][0]["is_required"] is True
    assert event["organizer"]["display_name"] == "Organizer"
    assert event["phase"] == "upcoming"
    assert event["starts_at"].endswith("Z")


def test_unpublished_event_is_hidden_until_published(login_as, client):
    organizer = login_as("organizer")
    event_id = organizer.post(f"{API}/events", json=_payload()).json()["id"]

    assert event_id not in [item["id"] for item in client.get(f"{API}/events").json()]
    assert client.get(f"{API}/events/{event_id}").status_code == 404
    assert login_as("alice").get(f"{API}/events/{event_id}").status_code == 404
    assert organizer.get(f"{API}/events/{event_id}").status_code == 200

    published = organizer.patch(f"{API}/events/{event_id}", json={"is_published": True})
    assert published.status_code == 200
    assert published.json()["published_at"] is not None
    assert client.get(f"{API}/events/{event_id}").status_code == 200
    assert event_id in [item["id"] for item in client.get(f"{API}/events").json()]


def test_public_event_detail_exposes_structure_and_viewer_context(client, login_as, event):
    response = client.get(f"{API}/events/{event.id}")
    assert response.status_code == 200
    body = response.json()
    assert [track["name"] for track in body["tracks"]] == ["AI", "Web"]
    assert body["phase"] == "active"
    assert body["registration_open"] is True
    assert body["viewer"] == {"is_authenticated": False, "is_registered": False, "can_manage": False, "team_id": None}
    assert "email" not in body["organizer"]

    organizer_view = login_as("organizer").get(f"{API}/events/{event.id}").json()
    assert organizer_view["viewer"]["can_manage"] is True


def test_schedule_validation(login_as):
    organizer = login_as("organizer")
    response = organizer.post(
        f"{API}/events", json=_payload(submission_deadline=_iso(timedelta(days=5)), ends_at=_iso(timedelta(days=3)))
    )
    assert response.status_code == 422
    assert "submission_deadline" in response.json()["error"]["fields"]

    response = organizer.post(f"{API}/events", json=_payload(ends_at=_iso(timedelta(hours=1))))
    assert response.status_code == 422


def test_duplicate_track_names_are_rejected(login_as):
    response = login_as("organizer").post(f"{API}/events", json=_payload(tracks=[{"name": "AI"}, {"name": "ai"}]))
    assert response.status_code == 422
    assert "tracks" in response.json()["error"]["fields"]


def test_explicit_slug_conflict(login_as):
    organizer = login_as("organizer")
    assert organizer.post(f"{API}/events", json=_payload(slug="my-hack")).status_code == 201
    response = organizer.post(f"{API}/events", json=_payload(slug="my-hack"))
    assert response.status_code == 409
    assert error_code(response) == "slug_taken"
    auto = organizer.post(f"{API}/events", json=_payload(name="My Hack"))
    assert auto.json()["slug"] == "my-hack-2"


def test_update_syncs_tracks_prizes_and_questions_by_id(login_as):
    organizer = login_as("organizer")
    event = organizer.post(f"{API}/events", json=_payload()).json()
    ai, climate = event["tracks"]

    response = organizer.patch(
        f"{API}/events/{event['id']}",
        json={
            "tracks": [{"name": "Health"}, {"id": ai["id"], "name": "Artificial Intelligence"}, {"name": "Climate"}],
            "prizes": [],
            "questions": [{"id": event["questions"][0]["id"], "prompt": "Why now?", "is_required": False}],
        },
    )
    assert response.status_code == 200, response.text
    updated = response.json()
    assert [track["name"] for track in updated["tracks"]] == ["Health", "Artificial Intelligence", "Climate"]
    assert updated["tracks"][1]["id"] == ai["id"]
    assert climate["description"] == "Planet first"
    assert updated["tracks"][2]["description"] is None  # the old Climate track was removed, not reused
    assert updated["prizes"] == []
    assert updated["questions"][0]["prompt"] == "Why now?"


def test_update_rejects_unknown_child_ids_and_cleared_required_fields(login_as, event):
    organizer = login_as("organizer")
    response = organizer.patch(f"{API}/events/{event.id}", json={"tracks": [{"id": 999999, "name": "X"}]})
    assert response.status_code == 422
    response = organizer.patch(f"{API}/events/{event.id}", json={"name": None})
    assert response.status_code == 422


def test_participant_registration(login_as, event):
    alice = login_as("alice")
    response = alice.post(f"{API}/events/{event.id}/registration")
    assert response.status_code == 201
    assert alice.get(f"{API}/events/{event.id}/registration").json()["event_id"] == event.id
    assert alice.get(f"{API}/events/{event.id}").json()["viewer"]["is_registered"] is True

    again = alice.post(f"{API}/events/{event.id}/registration")
    assert again.status_code == 409
    assert error_code(again) == "already_registered"

    mine = alice.get(f"{API}/me/events").json()
    assert [item["event"]["id"] for item in mine] == [event.id]
    assert mine[0]["team"] is None


def test_registration_respects_window_and_visibility(login_as, db, users):
    closed = create_event(db, users["organizer"], name="Closed Hack")
    closed.registration_closes_at = utcnow() - timedelta(minutes=5)
    db.commit()
    hidden = create_event(db, users["organizer"], name="Hidden Hack", published=False)

    alice = login_as("alice")
    response = alice.post(f"{API}/events/{closed.id}/registration")
    assert response.status_code == 409
    assert error_code(response) == "registration_closed"
    assert alice.post(f"{API}/events/{hidden.id}/registration").status_code == 404


def test_organizer_event_rosters(login_as, event):
    alice = login_as("alice")
    alice.post(f"{API}/events/{event.id}/registration")
    alice.post(f"{API}/events/{event.id}/teams", json={"name": "Roster"})

    organizer = login_as("organizer")
    registrations = organizer.get(f"{API}/events/{event.id}/registrations").json()
    assert registrations[0]["email"] == "alice@test.local"
    assert registrations[0]["team_name"] == "Roster"
    teams = organizer.get(f"{API}/events/{event.id}/teams").json()
    assert teams[0]["members"][0]["is_captain"] is True

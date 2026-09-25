from app.models import Event
from tests.factories import API, complete_payload, create_draft, create_event, create_team, error_code


def _team(login_as, event, user="alice"):
    client = login_as(user)
    return client, create_team(client, event.id)


def test_create_draft(login_as, event):
    alice, team = _team(login_as, event)
    draft = create_draft(alice, team["id"])
    assert draft["status"] == "draft"
    assert draft["state"] == "draft"
    assert draft["is_editable"] is True
    assert draft["team_name"] == team["name"]
    assert set(draft["missing_fields"]) >= {"title", "tagline", "description", "track_id"}

    again = alice.post(f"{API}/teams/{team['id']}/submission")
    assert (again.status_code, error_code(again)) == (409, "submission_exists")
    assert alice.get(f"{API}/teams/{team['id']}/submission").json()["id"] == draft["id"]


def test_save_draft_updates_only_provided_fields(login_as, event: Event):
    alice, team = _team(login_as, event)
    draft = create_draft(alice, team["id"])

    first = alice.patch(
        f"{API}/submissions/{draft['id']}",
        json={
            "title": "  Solar Scout  ",
            "tags": ["Python", "python", " React  Native ", "Go"],
            "images": ["https://img.example.com/1.png", "/uploads/abcdef0123.png"],
            "thumbnail_url": "https://img.example.com/thumb.png",
            "answers": [{"question_id": event.questions[0].id, "answer": "Because"}],
        },
    )
    assert first.status_code == 200, first.text
    body = first.json()
    assert body["title"] == "Solar Scout"
    assert body["tags"] == ["Python", "React Native", "Go"]
    assert body["images"] == ["https://img.example.com/1.png", "/uploads/abcdef0123.png"]
    assert body["answers"] == [{"question_id": event.questions[0].id, "answer": "Because"}]

    second = alice.patch(f"{API}/submissions/{draft['id']}", json={"tagline": "Sunny", "tags": ["go", "Rust"]})
    body = second.json()
    assert body["title"] == "Solar Scout"
    assert body["tagline"] == "Sunny"
    assert body["tags"] == ["go", "Rust"]
    assert body["images"] == ["https://img.example.com/1.png", "/uploads/abcdef0123.png"]


def test_teammate_can_edit_shared_draft(login_as, event):
    alice, team = _team(login_as, event)
    draft = create_draft(alice, team["id"])
    token = alice.post(f"{API}/teams/{team['id']}/invitations", json={}).json()["token"]
    bob = login_as("bob")
    bob.post(f"{API}/invitations/{token}/accept")
    response = bob.patch(f"{API}/submissions/{draft['id']}", json={"title": "Co-authored"})
    assert response.status_code == 200
    assert alice.get(f"{API}/submissions/{draft['id']}").json()["title"] == "Co-authored"


def test_url_and_reference_validation(login_as, event, db, users):
    alice, team = _team(login_as, event)
    draft = create_draft(alice, team["id"])
    url = f"{API}/submissions/{draft['id']}"

    bad_urls = alice.patch(url, json={"repo_url": "javascript:alert(1)", "thumbnail_url": "ftp://x/y.png"})
    assert bad_urls.status_code == 422
    assert {"repo_url", "thumbnail_url"} <= set(bad_urls.json()["error"]["fields"])

    other_event = create_event(db, users["organizer"], name="Other Hack", tracks=("Other",))
    foreign_track = alice.patch(url, json={"track_id": other_event.tracks[0].id})
    assert (foreign_track.status_code, list(foreign_track.json()["error"]["fields"])) == (422, ["track_id"])

    foreign_question = alice.patch(url, json={"answers": [{"question_id": other_event.questions[0].id, "answer": "x"}]})
    assert foreign_question.status_code == 422

    cleared = alice.patch(url, json={"repo_url": "", "track_id": None})
    assert cleared.status_code == 200
    assert cleared.json()["repo_url"] is None


def test_submit_requires_required_fields(login_as, event):
    alice, team = _team(login_as, event)
    draft = create_draft(alice, team["id"])
    response = alice.post(f"{API}/submissions/{draft['id']}/submit")
    assert response.status_code == 422
    fields = response.json()["error"]["fields"]
    assert {"title", "tagline", "description", "track_id", f"answers.{event.questions[0].id}"} == set(fields)
    assert alice.get(f"{API}/submissions/{draft['id']}").json()["status"] == "draft"


def test_submit_transitions_to_submitted(login_as, event):
    alice, team = _team(login_as, event)
    draft = create_draft(alice, team["id"])
    alice.patch(f"{API}/submissions/{draft['id']}", json=complete_payload(event))

    response = alice.post(f"{API}/submissions/{draft['id']}/submit")
    assert response.status_code == 200
    body = response.json()
    assert (body["status"], body["state"], body["is_editable"]) == ("submitted", "submitted", True)
    assert body["submitted_at"] is not None
    assert body["missing_fields"] == {}

    again = alice.post(f"{API}/submissions/{draft['id']}/submit")
    assert again.status_code == 200
    assert again.json()["submitted_at"] == body["submitted_at"]
    assert alice.get(f"{API}/events/{event.id}/my-team").json()["submission"]["state"] == "submitted"


def test_submitted_project_stays_editable_but_must_remain_complete(login_as, event):
    alice, team = _team(login_as, event)
    draft = create_draft(alice, team["id"])
    alice.patch(f"{API}/submissions/{draft['id']}", json=complete_payload(event))
    alice.post(f"{API}/submissions/{draft['id']}/submit")

    edited = alice.patch(f"{API}/submissions/{draft['id']}", json={"tagline": "Now even sunnier"})
    assert edited.status_code == 200
    assert edited.json()["status"] == "submitted"

    broken = alice.patch(f"{API}/submissions/{draft['id']}", json={"title": ""})
    assert broken.status_code == 422
    assert alice.get(f"{API}/submissions/{draft['id']}").json()["title"] == "Solar Scout"


def test_event_without_tracks_or_required_questions(login_as, db, users):
    event = create_event(db, users["organizer"], name="Open Hack", tracks=(), required_question=False)
    alice, team = _team(login_as, event)
    draft = create_draft(alice, team["id"])
    alice.patch(f"{API}/submissions/{draft['id']}", json={"title": "T", "tagline": "Tag", "description": "D"})
    assert alice.post(f"{API}/submissions/{draft['id']}/submit").status_code == 200

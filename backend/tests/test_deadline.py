"""The submission deadline is enforced by the server clock on every mutating endpoint."""

from tests.factories import (
    API,
    close_submissions,
    complete_payload,
    create_draft,
    create_team,
    error_code,
    invite_token,
    register,
    submit_project,
)


def _assert_deadline_rejected(response):
    assert response.status_code == 403, response.text
    assert error_code(response) == "deadline_passed"


def test_mutations_allowed_before_deadline(login_as, event):
    alice = login_as("alice")
    team = create_team(alice, event.id)
    draft = create_draft(alice, team["id"])
    assert alice.patch(f"{API}/submissions/{draft['id']}", json=complete_payload(event)).status_code == 200
    assert alice.post(f"{API}/submissions/{draft['id']}/submit").status_code == 200


def test_direct_api_edits_and_submits_rejected_after_deadline(login_as, db, event):
    alice = login_as("alice")
    team = create_team(alice, event.id)
    draft = create_draft(alice, team["id"])
    alice.patch(f"{API}/submissions/{draft['id']}", json=complete_payload(event))

    close_submissions(db, event)

    _assert_deadline_rejected(alice.patch(f"{API}/submissions/{draft['id']}", json={"title": "Too late"}))
    _assert_deadline_rejected(alice.post(f"{API}/submissions/{draft['id']}/submit"))
    current = alice.get(f"{API}/submissions/{draft['id']}").json()
    assert current["title"] == "Solar Scout"
    assert (current["status"], current["state"], current["is_editable"]) == ("draft", "closed", False)


def test_submitted_project_is_locked_after_deadline(login_as, db, event):
    alice = login_as("alice")
    team = create_team(alice, event.id)
    project = submit_project(alice, event, team["id"])

    close_submissions(db, event)

    locked = alice.get(f"{API}/submissions/{project['id']}").json()
    assert (locked["status"], locked["state"], locked["is_editable"]) == ("submitted", "locked", False)
    _assert_deadline_rejected(alice.patch(f"{API}/submissions/{project['id']}", json={"tagline": "Edited"}))
    assert login_as("carol").get(f"{API}/gallery/projects/{project['id']}").status_code == 200


def test_new_submissions_and_team_changes_rejected_after_deadline(login_as, db, event):
    alice = login_as("alice")
    team = create_team(alice, event.id)
    token = invite_token(alice, team["id"])
    bob = login_as("bob")
    register(bob, event.id)

    close_submissions(db, event)

    _assert_deadline_rejected(alice.post(f"{API}/teams/{team['id']}/submission"))
    _assert_deadline_rejected(alice.post(f"{API}/teams/{team['id']}/invitations", json={}))
    _assert_deadline_rejected(alice.patch(f"{API}/teams/{team['id']}", json={"name": "Late rename"}))
    _assert_deadline_rejected(bob.post(f"{API}/invitations/{token}/accept"))
    _assert_deadline_rejected(bob.post(f"{API}/events/{event.id}/teams", json={"name": "Late team"}))


def test_event_reports_closed_phase_after_deadline(client, db, event):
    close_submissions(db, event)
    body = client.get(f"{API}/events/{event.id}").json()
    assert (body["phase"], body["submissions_open"], body["registration_open"]) == ("closed", False, False)

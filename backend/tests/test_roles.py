import pytest

from tests.factories import API, create_draft, create_team, error_code, invite_token

EVENT_PAYLOAD = {
    "name": "Role Hack",
    "starts_at": "2030-01-01T09:00:00Z",
    "ends_at": "2030-01-03T09:00:00Z",
    "submission_deadline": "2030-01-03T09:00:00Z",
}


@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("get", "/auth/me"),
        ("get", "/me/events"),
        ("get", "/events/manage"),
        ("post", "/events"),
        ("patch", "/events/1"),
        ("post", "/events/1/registration"),
        ("post", "/events/1/teams"),
        ("get", "/events/1/my-team"),
        ("get", "/teams/1"),
        ("post", "/teams/1/invitations"),
        ("post", "/invitations/abcdefghijklmnopqrstuvwxyz/accept"),
        ("get", "/teams/1/submission"),
        ("post", "/teams/1/submission"),
        ("get", "/submissions/1"),
        ("patch", "/submissions/1"),
        ("post", "/submissions/1/submit"),
        ("get", "/admin/users"),
        ("post", "/uploads/images"),
    ],
)
def test_private_endpoints_require_authentication(client, method, path):
    kwargs = {"json": {}} if method in ("post", "patch") and path != "/uploads/images" else {}
    response = getattr(client, method)(f"{API}{path}", **kwargs)
    assert response.status_code == 401, (path, response.text)


def test_participant_and_judge_cannot_use_organizer_or_admin_endpoints(login_as, event):
    for role in ("alice", "judge"):
        client = login_as(role)
        assert client.post(f"{API}/events", json=EVENT_PAYLOAD).status_code == 403
        assert client.get(f"{API}/events/manage").status_code == 403
        assert client.patch(f"{API}/events/{event.id}", json={"name": "Hijacked"}).status_code == 403
        assert client.get(f"{API}/events/{event.id}/registrations").status_code == 403
        assert client.get(f"{API}/events/{event.id}/submissions").status_code == 403
        assert client.get(f"{API}/admin/users").status_code == 403


def test_judge_authenticates_but_cannot_act_as_participant(login_as, event):
    judge = login_as("judge")
    assert judge.get(f"{API}/auth/me").json()["role"] == "judge"
    response = judge.post(f"{API}/events/{event.id}/registration")
    assert response.status_code == 403
    assert error_code(response) == "participants_only"


def test_organizer_cannot_manage_another_organizers_event(login_as, event):
    other = login_as("other_organizer")
    assert other.patch(f"{API}/events/{event.id}", json={"name": "Mine now"}).status_code == 403
    assert other.get(f"{API}/events/{event.id}/teams").status_code == 403
    assert event.id not in [item["id"] for item in other.get(f"{API}/events/manage").json()]


def test_admin_can_manage_any_event(login_as, event):
    admin = login_as("admin")
    response = admin.patch(f"{API}/events/{event.id}", json={"name": "Admin Edited"})
    assert response.status_code == 200
    assert response.json()["name"] == "Admin Edited"
    assert event.id in [item["id"] for item in admin.get(f"{API}/events/manage").json()]


def test_participant_cannot_access_another_teams_private_resources(login_as, event):
    alice = login_as("alice")
    team = create_team(alice, event.id, "Alpha")
    draft = create_draft(alice, team["id"])

    bob = login_as("bob")
    create_team(bob, event.id, "Bravo")
    checks = [
        bob.get(f"{API}/teams/{team['id']}"),
        bob.patch(f"{API}/teams/{team['id']}", json={"name": "Stolen"}),
        bob.get(f"{API}/teams/{team['id']}/invitations"),
        bob.post(f"{API}/teams/{team['id']}/invitations", json={}),
        bob.get(f"{API}/teams/{team['id']}/submission"),
        bob.post(f"{API}/teams/{team['id']}/submission"),
        bob.get(f"{API}/submissions/{draft['id']}"),
        bob.patch(f"{API}/submissions/{draft['id']}", json={"title": "Hacked"}),
        bob.post(f"{API}/submissions/{draft['id']}/submit"),
    ]
    for response in checks:
        assert response.status_code == 403, response.text

    assert alice.get(f"{API}/submissions/{draft['id']}").json()["title"] == ""


def test_team_member_who_is_not_captain_cannot_invite(login_as, event):
    alice = login_as("alice")
    team = create_team(alice, event.id)
    bob = login_as("bob")
    assert bob.post(f"{API}/invitations/{invite_token(alice, team['id'])}/accept").status_code == 200

    response = bob.post(f"{API}/teams/{team['id']}/invitations", json={})
    assert response.status_code == 403
    assert error_code(response) == "captain_only"


def test_organizer_can_read_but_not_edit_participant_submission(login_as, event):
    alice = login_as("alice")
    team = create_team(alice, event.id)
    draft = create_draft(alice, team["id"])

    organizer = login_as("organizer")
    assert organizer.get(f"{API}/submissions/{draft['id']}").status_code == 200
    assert organizer.get(f"{API}/teams/{team['id']}").status_code == 200
    response = organizer.patch(f"{API}/submissions/{draft['id']}", json={"title": "Organizer edit"})
    assert response.status_code == 403


def test_admin_manages_roles_but_cannot_demote_self(login_as, users):
    admin = login_as("admin")
    response = admin.patch(f"{API}/admin/users/{users['alice'].id}", json={"role": "organizer"})
    assert response.status_code == 200
    assert response.json()["role"] == "organizer"

    response = admin.patch(f"{API}/admin/users/{users['admin'].id}", json={"role": "participant"})
    assert response.status_code == 409
    assert error_code(response) == "self_demotion"


def test_role_change_takes_effect_on_next_request(login_as, users):
    alice = login_as("alice")
    assert alice.get(f"{API}/events/manage").status_code == 403
    login_as("admin").patch(f"{API}/admin/users/{users['alice'].id}", json={"role": "organizer"})
    assert alice.get(f"{API}/events/manage").status_code == 200


def test_deactivated_user_session_is_revoked(login_as, users):
    alice = login_as("alice")
    login_as("admin").patch(f"{API}/admin/users/{users['alice'].id}", json={"is_active": False})
    assert alice.get(f"{API}/auth/me").status_code == 401

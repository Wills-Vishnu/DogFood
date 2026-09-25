from datetime import timedelta

from sqlalchemy import select

from app.core.clock import utcnow
from app.models import TeamInvitation
from tests.factories import API, create_event, create_team, error_code, invite_token, register


def test_team_creation_requires_registration(login_as, event):
    alice = login_as("alice")
    response = alice.post(f"{API}/events/{event.id}/teams", json={"name": "Early"})
    assert response.status_code == 403
    assert error_code(response) == "not_registered"


def test_create_team_makes_creator_captain(login_as, event):
    alice = login_as("alice")
    team = create_team(alice, event.id, "Rocket")
    assert team["name"] == "Rocket"
    assert team["captain_id"] == team["members"][0]["user_id"]
    assert team["members"][0]["is_captain"] is True
    assert team["max_team_size"] == 4
    assert alice.get(f"{API}/events/{event.id}/my-team").json()["id"] == team["id"]


def test_one_team_per_participant_per_event(login_as, event):
    alice = login_as("alice")
    create_team(alice, event.id, "First")
    response = alice.post(f"{API}/events/{event.id}/teams", json={"name": "Second"})
    assert response.status_code == 409
    assert error_code(response) == "already_in_team"


def test_team_names_are_unique_per_event(login_as, event):
    create_team(login_as("alice"), event.id, "Rocket")
    bob = login_as("bob")
    register(bob, event.id)
    response = bob.post(f"{API}/events/{event.id}/teams", json={"name": "ROCKET"})
    assert response.status_code == 409
    assert error_code(response) == "team_name_taken"


def test_invitation_flow_preview_and_accept(login_as, client, event):
    alice = login_as("alice")
    team = create_team(alice, event.id)
    token = invite_token(alice, team["id"])

    preview = client.get(f"{API}/invitations/{token}")
    assert preview.status_code == 200
    assert preview.json()["team_name"] == team["name"]
    assert preview.json()["status"] == "active"

    bob = login_as("bob")
    accepted = bob.post(f"{API}/invitations/{token}/accept")
    assert accepted.status_code == 200, accepted.text
    assert [member["email"] for member in accepted.json()["members"]] == ["alice@test.local", "bob@test.local"]
    # Accepting also registers the invitee for the event.
    assert bob.get(f"{API}/events/{event.id}/registration").json() is not None

    listing = alice.get(f"{API}/teams/{team['id']}/invitations").json()
    assert listing[0]["status"] == "accepted"
    assert listing[0]["accepted_by_name"] == "Bob"
    assert "token" not in listing[0]


def test_invitation_is_single_use(login_as, event):
    alice = login_as("alice")
    token = invite_token(alice, create_team(alice, event.id)["id"])
    assert login_as("bob").post(f"{API}/invitations/{token}/accept").status_code == 200
    response = login_as("carol").post(f"{API}/invitations/{token}/accept")
    assert response.status_code == 410
    assert error_code(response) == "invitation_accepted"


def test_expired_revoked_and_unknown_invitations(login_as, db, event):
    alice = login_as("alice")
    team = create_team(alice, event.id)
    expired_token = invite_token(alice, team["id"])
    revoked_token = invite_token(alice, team["id"])

    invitations = db.scalars(select(TeamInvitation).order_by(TeamInvitation.id)).all()
    invitations[0].expires_at = utcnow() - timedelta(minutes=1)
    db.commit()
    revoke = alice.delete(f"{API}/teams/{team['id']}/invitations/{invitations[1].id}")
    assert revoke.json()["status"] == "revoked"

    bob = login_as("bob")
    expired = bob.post(f"{API}/invitations/{expired_token}/accept")
    assert (expired.status_code, error_code(expired)) == (410, "invitation_expired")
    revoked = bob.post(f"{API}/invitations/{revoked_token}/accept")
    assert (revoked.status_code, error_code(revoked)) == (410, "invitation_revoked")
    unknown = bob.post(f"{API}/invitations/this-token-does-not-exist-0000/accept")
    assert (unknown.status_code, error_code(unknown)) == (404, "invitation_not_found")


def test_cannot_accept_when_already_on_a_team(login_as, event):
    alice = login_as("alice")
    token = invite_token(alice, create_team(alice, event.id, "Alpha")["id"])
    bob = login_as("bob")
    create_team(bob, event.id, "Bravo")

    response = bob.post(f"{API}/invitations/{token}/accept")
    assert (response.status_code, error_code(response)) == (409, "already_in_team")
    assert alice.post(f"{API}/invitations/{token}/accept").status_code == 409


def test_team_size_limit(login_as, db, users):
    small = create_event(db, users["organizer"], name="Small Hack", max_team_size=2)
    alice = login_as("alice")
    team = create_team(alice, small.id)
    first = invite_token(alice, team["id"])
    second = invite_token(alice, team["id"])
    assert login_as("bob").post(f"{API}/invitations/{first}/accept").status_code == 200

    response = login_as("carol").post(f"{API}/invitations/{second}/accept")
    assert (response.status_code, error_code(response)) == (409, "team_full")
    full = alice.post(f"{API}/teams/{team['id']}/invitations", json={})
    assert (full.status_code, error_code(full)) == (409, "team_full")


def test_leave_team_and_captain_restriction(login_as, event):
    alice = login_as("alice")
    team = create_team(alice, event.id)
    bob = login_as("bob")
    bob.post(f"{API}/invitations/{invite_token(alice, team['id'])}/accept")

    captain_leave = alice.post(f"{API}/teams/{team['id']}/leave")
    assert (captain_leave.status_code, error_code(captain_leave)) == (409, "captain_cannot_leave")
    assert bob.post(f"{API}/teams/{team['id']}/leave").status_code == 204
    assert bob.get(f"{API}/events/{event.id}/my-team").json() is None
    assert bob.get(f"{API}/teams/{team['id']}").status_code == 403


def test_captain_can_rename_team(login_as, event):
    alice = login_as("alice")
    team = create_team(alice, event.id)
    response = alice.patch(f"{API}/teams/{team['id']}", json={"name": "Renamed"})
    assert response.status_code == 200
    assert response.json()["name"] == "Renamed"

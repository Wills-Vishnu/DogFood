from datetime import timedelta

from sqlalchemy import select

from app.core.clock import utcnow
from app.models import User, UserSession
from tests.factories import API, PASSWORD, error_code


def _register(client, email="new@test.local", password="LongEnough1", name="New Person", **extra):
    return client.post(
        f"{API}/auth/register", json={"email": email, "password": password, "display_name": name, **extra}
    )


def test_register_creates_participant_and_starts_session(client, db):
    response = _register(client, email="New@Test.Local")
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "new@test.local"
    assert body["role"] == "participant"
    assert "password" not in response.text

    cookie = response.headers["set-cookie"].lower()
    assert "dogfood_session=" in cookie
    assert "httponly" in cookie
    assert "samesite=lax" in cookie

    me = client.get(f"{API}/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "new@test.local"

    stored = db.scalar(select(User).where(User.email == "new@test.local"))
    assert stored.password_hash.startswith("scrypt$")
    assert "LongEnough1" not in stored.password_hash


def test_register_ignores_client_supplied_role(client):
    response = _register(client, role="admin")
    assert response.status_code == 201
    assert response.json()["role"] == "participant"


def test_register_rejects_duplicate_email_case_insensitively(client, make_client):
    assert _register(client, email="dup@test.local").status_code == 201
    response = _register(make_client(), email="DUP@test.local")
    assert response.status_code == 409
    assert error_code(response) == "email_taken"


def test_register_validates_input(client):
    response = _register(client, email="not-an-email", password="short", name="   ")
    assert response.status_code == 422
    body = response.json()["error"]
    assert body["code"] == "validation_error"
    assert {"email", "password", "display_name"} <= set(body["fields"])


def test_login_success_and_failures(client, users):
    ok = client.post(f"{API}/auth/login", json={"email": "ALICE@test.local", "password": PASSWORD})
    assert ok.status_code == 200
    assert ok.json()["email"] == "alice@test.local"

    wrong = client.post(f"{API}/auth/login", json={"email": "alice@test.local", "password": "nope-nope"})
    unknown = client.post(f"{API}/auth/login", json={"email": "ghost@test.local", "password": "nope-nope"})
    for response in (wrong, unknown):
        assert response.status_code == 401
        assert error_code(response) == "invalid_credentials"
    assert wrong.json() == unknown.json()


def test_inactive_user_cannot_log_in(client, db, users):
    users["alice"].is_active = False
    db.commit()
    response = client.post(f"{API}/auth/login", json={"email": "alice@test.local", "password": PASSWORD})
    assert response.status_code == 401


def test_logout_revokes_session_server_side(login_as, make_client):
    client = login_as("alice")
    token = client.cookies.get("dogfood_session")
    assert token

    assert client.post(f"{API}/auth/logout").status_code == 204
    assert client.get(f"{API}/auth/me").status_code == 401

    replay = make_client().get(f"{API}/auth/me", headers={"Cookie": f"dogfood_session={token}"})
    assert replay.status_code == 401


def test_expired_session_is_rejected(login_as, db, users):
    client = login_as("alice")
    session = db.scalar(select(UserSession).where(UserSession.user_id == users["alice"].id))
    session.expires_at = utcnow() - timedelta(seconds=1)
    db.commit()
    response = client.get(f"{API}/auth/me")
    assert response.status_code == 401
    assert error_code(response) == "not_authenticated"


def test_forged_session_cookie_is_rejected(client):
    response = client.get(f"{API}/auth/me", headers={"Cookie": "dogfood_session=forged-token-value"})
    assert response.status_code == 401


def test_unauthenticated_me_uses_error_format(client):
    response = client.get(f"{API}/auth/me")
    assert response.status_code == 401
    assert response.json() == {"error": {"code": "not_authenticated", "message": "Please sign in to continue"}}


def test_profile_update_cannot_change_role_or_email(login_as):
    client = login_as("alice")
    response = client.patch(
        f"{API}/auth/me", json={"display_name": "  Alice   Smith ", "bio": "Builder", "role": "admin", "email": "x@y.z"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["display_name"] == "Alice Smith"
    assert body["bio"] == "Builder"
    assert body["role"] == "participant"
    assert body["email"] == "alice@test.local"


def test_cross_site_write_is_rejected(client):
    response = client.post(
        f"{API}/auth/login",
        json={"email": "alice@test.local", "password": PASSWORD},
        headers={"Origin": "https://evil.example"},
    )
    assert response.status_code == 403
    assert error_code(response) == "origin_rejected"

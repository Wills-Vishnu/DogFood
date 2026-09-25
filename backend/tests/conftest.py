import os
import tempfile

os.environ.setdefault("UPLOAD_DIR", tempfile.mkdtemp(prefix="dogfood-test-uploads-"))

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.db.base import Base  # noqa: E402
from app.db.session import build_engine, build_session_factory, get_db  # noqa: E402
from app.main import create_app  # noqa: E402
from app.models import Role  # noqa: E402
from tests.factories import PASSWORD, create_event, create_user  # noqa: E402

# Point TEST_DATABASE_URL at a disposable MySQL database to run the suite against MySQL.
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")


@pytest.fixture
def engine(tmp_path):
    engine = build_engine(TEST_DATABASE_URL or f"sqlite:///{tmp_path / 'test.db'}")
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
def session_factory(engine):
    return build_session_factory(engine)


@pytest.fixture
def db(session_factory):
    with session_factory() as session:
        yield session


@pytest.fixture
def app(session_factory):
    application = create_app()

    def override_get_db():
        session = session_factory()
        try:
            yield session
        finally:
            session.close()

    application.dependency_overrides[get_db] = override_get_db
    return application


@pytest.fixture
def make_client(app):
    clients: list[TestClient] = []

    def factory() -> TestClient:
        client = TestClient(app)
        clients.append(client)
        return client

    yield factory
    for client in clients:
        client.close()


@pytest.fixture
def client(make_client) -> TestClient:
    return make_client()


@pytest.fixture
def users(db):
    return {
        "admin": create_user(db, "admin@test.local", Role.ADMIN),
        "organizer": create_user(db, "organizer@test.local", Role.ORGANIZER),
        "other_organizer": create_user(db, "organizer2@test.local", Role.ORGANIZER),
        "judge": create_user(db, "judge@test.local", Role.JUDGE),
        "alice": create_user(db, "alice@test.local"),
        "bob": create_user(db, "bob@test.local"),
        "carol": create_user(db, "carol@test.local"),
        "dave": create_user(db, "dave@test.local"),
    }


@pytest.fixture
def login_as(make_client, users):
    def login(key: str) -> TestClient:
        client = make_client()
        response = client.post("/api/v1/auth/login", json={"email": users[key].email, "password": PASSWORD})
        assert response.status_code == 200, response.text
        return client

    return login


@pytest.fixture
def event(db, users):
    """A published event whose submission window is open, with two tracks and one required question."""
    return create_event(db, users["organizer"])

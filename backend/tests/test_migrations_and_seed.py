from pathlib import Path

from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.config import Config
from alembic.migration import MigrationContext
from sqlalchemy import func, select

from app.db.base import Base
from app.db.session import build_engine
from app.models import Event, Submission, User
from app.seed import ACTIVE_INVITE_TOKEN, seed
from tests.factories import API

BACKEND_ROOT = Path(__file__).resolve().parents[1]


def _alembic_config(url: str) -> Config:
    config = Config(str(BACKEND_ROOT / "alembic.ini"))
    config.attributes["database_url"] = url
    return config


def test_migrations_match_models_and_round_trip(tmp_path):
    url = f"sqlite:///{tmp_path / 'migrations.db'}"
    config = _alembic_config(url)
    command.upgrade(config, "head")

    engine = build_engine(url)
    with engine.connect() as connection:
        diff = compare_metadata(MigrationContext.configure(connection), Base.metadata)
    assert diff == []

    command.downgrade(config, "base")
    command.upgrade(config, "head")
    engine.dispose()


def test_seed_is_idempotent_and_usable(db, client):
    seed(db)
    seed(db)
    assert db.scalar(select(func.count()).select_from(User)) == 7
    assert db.scalar(select(func.count()).select_from(Event)) == 3
    assert db.scalar(select(func.count()).select_from(Submission)) == 3

    titles = sorted(item["title"] for item in client.get(f"{API}/gallery/projects").json()["items"])
    assert titles == ["MindFlow: AI-Powered Learning Assistant", "Pocket Planner"]
    assert client.get(f"{API}/invitations/{ACTIVE_INVITE_TOKEN}").json()["status"] == "active"

    login = client.post(f"{API}/auth/login", json={"email": "jamie@dogfood.local", "password": "DogfoodParticipant1!"})
    assert login.status_code == 200
    joined = client.post(f"{API}/invitations/{ACTIVE_INVITE_TOKEN}/accept")
    assert joined.status_code == 200, joined.text
    assert joined.json()["name"] == "ChainForge"

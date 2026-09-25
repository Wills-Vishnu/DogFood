import time

from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app.db.session import get_engine


def wait_for_database(timeout_seconds: float = 120) -> None:
    deadline = time.monotonic() + timeout_seconds
    while True:
        try:
            with get_engine().connect() as connection:
                connection.execute(text("SELECT 1"))
            print("Database is ready", flush=True)
            return
        except OperationalError as exc:
            if time.monotonic() > deadline:
                raise
            print(f"Waiting for database ({exc.orig.__class__.__name__})...", flush=True)
            time.sleep(2)


if __name__ == "__main__":
    wait_for_database()

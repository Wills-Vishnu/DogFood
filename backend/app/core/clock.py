from datetime import datetime, timezone


def utcnow() -> datetime:
    # Persisted timestamps are naive UTC so MySQL DATETIME and SQLite compare identically.
    return datetime.now(timezone.utc).replace(tzinfo=None)

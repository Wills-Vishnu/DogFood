#!/bin/sh
set -e

python -m app.db.wait
alembic upgrade head

if [ "${SEED_DATA:-false}" = "true" ]; then
  python -m app.seed
fi

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips="*"

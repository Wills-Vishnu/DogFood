# DOGFOOD

Self-hosted hackathon platform. This repository contains the React frontend (repository root), the FastAPI backend (`backend/`) and a Docker Compose stack that runs everything locally with no cloud services.

```
React (nginx) ──/api, /uploads──▶ FastAPI ──SQLAlchemy──▶ MySQL 8.4
                                      └──▶ uploads volume (images)
```

## Quick start

```bash
docker compose up --build
```

Open http://localhost:3000. Interactive API docs are at http://localhost:3000/api/docs.

On start-up the backend waits for MySQL, applies Alembic migrations and (while `SEED_DATA=true`) loads idempotent demo data. MySQL data and uploaded images live in the `mysql_data` and `uploads_data` volumes, so they survive restarts. Copy `.env.example` to `.env` to change passwords, ports or cookie settings; set `SEED_DATA=false` and `COOKIE_SECURE=true` (behind HTTPS) for a real deployment.

### Demo accounts (seed data)

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@dogfood.local | DogfoodAdmin1! |
| Organizer | organizer@dogfood.local | DogfoodOrganizer1! |
| Judge | judge@dogfood.local | DogfoodJudge1! |
| Participant (captain, submitted project) | riley@dogfood.local | DogfoodParticipant1! |
| Participant (captain, draft project) | sam@dogfood.local | DogfoodParticipant1! |
| Participant (registered, no team) | jamie@dogfood.local | DogfoodParticipant1! |

The seed includes an open event (TechHacks 2026), an event whose deadline has passed (Winter Build 2026, with a locked project), an unpublished draft event, and team invitations: `/invite/seed-chainforge-invite-token` (active) and `/invite/seed-neuralflux-expired-token` (expired).

## What T1 covers

- **Accounts** – registration, login, logout and `/auth/me`; scrypt password hashing; server-side sessions in an HttpOnly, SameSite=Lax cookie with expiry; cross-site writes from unknown origins are rejected.
- **Roles** – participant, judge, organizer and admin, enforced by the API on every request (role, ownership and event scope). New accounts are always participants; admins change roles.
- **Events** – organizers create, edit and publish events with schedule, tracks, prizes and custom submission questions. Unpublished events are visible only to their organizer and admins.
- **Registration & teams** – participants register for an event, create a team, and invite teammates with single-use, expiring invitation links (only a hash of each token is stored).
- **Submissions** – drafts with project name, tagline, description, thumbnail, image gallery, demo video, repository and live links, technology tags, track and custom-question answers. Drafts can be edited until the deadline; submitting requires the required fields.
- **Deadlines** – every team and submission mutation checks the event deadline against the server clock, so direct API calls after the deadline are rejected (`403 deadline_passed`). Submitted projects become `locked`.
- **Gallery** – public search (name, tagline, description, technologies, track, team), filters (event, track, technology), sorting and pagination over submitted projects in published events only. Drafts, emails and question answers are never public.
- **Uploads** – images are type-checked by content, limited to 5 MB and stored on the local uploads volume.

Judging, voting, comments, audit logs and exports (T2–T4) are not implemented yet; their pages still use mock data.

## Local development

Requirements: Python 3.12, Node 20+, and a MySQL 8 database.

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements-dev.txt   # macOS/Linux: .venv/bin/pip
export DATABASE_URL="mysql+pymysql://dogfood:dogfood@localhost:3306/dogfood?charset=utf8mb4"
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

In another terminal, from the repository root:

```bash
npm install
npm start
```

The React dev server forwards `/api` and `/uploads` to `http://localhost:8000` (see `src/setupProxy.js`; override with `DOGFOOD_API_URL`).

## Tests

```bash
cd backend && .venv/Scripts/python -m pytest
```

The backend suite covers authentication, sessions, role and ownership checks, events, registration, teams and invitations, submissions, deadline enforcement, the gallery, uploads, migrations and the seed. It runs against a throwaway SQLite database by default; set `TEST_DATABASE_URL` to an empty MySQL database to run it against MySQL.

```bash
CI=true npm test
```

## Project layout

```
backend/
  app/api/v1/      HTTP routes and response serializers
  app/services/    business rules (auth, events, registrations, teams, submissions, gallery, uploads, admin)
  app/models/      SQLAlchemy models
  app/schemas/     Pydantic request/response schemas
  app/core/        settings, security, errors, clock
  alembic/         database migrations
  tests/           pytest suite
src/
  api/             fetch client and endpoint modules
  auth/            session context
  pages/           public, participant, organizer, admin (and mock T2–T4) pages
```

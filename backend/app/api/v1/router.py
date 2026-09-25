from fastapi import APIRouter
from sqlalchemy import text

from app.api.deps import DbSession
from app.api.v1 import admin, auth, events, gallery, me, submissions, teams

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(events.router)
api_router.include_router(teams.router)
api_router.include_router(submissions.router)
api_router.include_router(gallery.router)
api_router.include_router(me.router)
api_router.include_router(admin.router)


@api_router.get("/health", tags=["health"])
def health(db: DbSession) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "ok"}

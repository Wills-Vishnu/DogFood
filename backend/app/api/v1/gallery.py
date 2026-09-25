import math
from typing import Literal

from fastapi import APIRouter, Query

from app.api.deps import DbSession
from app.api.v1.serializers import project_card_out, project_detail_out
from app.schemas.gallery import GalleryFiltersOut, NamedRef, ProjectDetailOut, ProjectPageOut, TrackFilterOut
from app.services import gallery as gallery_service

router = APIRouter(prefix="/gallery", tags=["gallery"])


@router.get("/projects", response_model=ProjectPageOut)
def list_projects(
    db: DbSession,
    q: str | None = Query(default=None, max_length=100),
    event_id: int | None = None,
    track_id: int | None = None,
    tag: str | None = Query(default=None, max_length=50),
    sort: Literal["newest", "oldest", "title"] = "newest",
    page: int = Query(default=1, ge=1, le=10_000),
    page_size: int = Query(default=12, ge=1, le=50),
):
    items, total = gallery_service.search_projects(
        db, q=q, event_id=event_id, track_id=track_id, tag=tag, sort=sort, page=page, page_size=page_size
    )
    return ProjectPageOut(
        items=[project_card_out(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=max(1, math.ceil(total / page_size)),
    )


@router.get("/projects/{submission_id}", response_model=ProjectDetailOut)
def get_project(submission_id: int, db: DbSession):
    return project_detail_out(gallery_service.get_public_project(db, submission_id))


@router.get("/filters", response_model=GalleryFiltersOut)
def get_filters(db: DbSession, event_id: int | None = None):
    events, tracks, tags = gallery_service.gallery_filters(db, event_id)
    return GalleryFiltersOut(
        events=[NamedRef(id=event.id, name=event.name) for event in events],
        tracks=[TrackFilterOut(id=track.id, name=track.name, event_id=track.event_id) for track in tracks],
        tags=tags,
    )

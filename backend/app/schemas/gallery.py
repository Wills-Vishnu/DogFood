from pydantic import BaseModel

from app.schemas.common import ApiDateTime


class NamedRef(BaseModel):
    id: int
    name: str


class ProjectCardOut(BaseModel):
    id: int
    title: str
    tagline: str
    thumbnail_url: str | None
    tags: list[str]
    track_name: str | None
    team_name: str
    event_id: int
    event_name: str
    submitted_at: ApiDateTime | None


class ProjectPageOut(BaseModel):
    items: list[ProjectCardOut]
    total: int
    page: int
    page_size: int
    pages: int


class PublicTeamOut(BaseModel):
    name: str
    members: list[str]


class ProjectDetailOut(BaseModel):
    id: int
    title: str
    tagline: str
    description: str
    thumbnail_url: str | None
    images: list[str]
    demo_video_url: str | None
    repo_url: str | None
    live_url: str | None
    tags: list[str]
    track: NamedRef | None
    team: PublicTeamOut
    event: NamedRef
    submitted_at: ApiDateTime | None


class TrackFilterOut(BaseModel):
    id: int
    name: str
    event_id: int


class GalleryFiltersOut(BaseModel):
    events: list[NamedRef]
    tracks: list[TrackFilterOut]
    tags: list[str]

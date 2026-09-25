from pydantic import BaseModel

from app.models import Role
from app.schemas.common import ApiDateTime
from app.schemas.events import EventOut
from app.schemas.teams import TeamOut, TeamSubmissionSummary


class MyEventOut(BaseModel):
    event: EventOut
    registered_at: ApiDateTime
    team: TeamOut | None
    submission: TeamSubmissionSummary | None


class AdminUserUpdate(BaseModel):
    role: Role | None = None
    is_active: bool | None = None


class AdminOverviewOut(BaseModel):
    user_count: int
    users_by_role: dict[str, int]
    event_count: int
    published_event_count: int
    active_event_count: int
    team_count: int
    submission_count: int
    submitted_count: int

from pydantic import BaseModel, Field

from app.schemas.common import ApiDateTime, text


class TeamCreate(BaseModel):
    name: text(100, min_length=1)


class TeamUpdate(BaseModel):
    name: text(100, min_length=1)


class TeamMemberOut(BaseModel):
    user_id: int
    display_name: str
    email: str
    is_captain: bool
    joined_at: ApiDateTime


class TeamSubmissionSummary(BaseModel):
    id: int
    title: str
    status: str
    state: str
    submitted_at: ApiDateTime | None
    updated_at: ApiDateTime


class TeamOut(BaseModel):
    id: int
    event_id: int
    event_name: str
    name: str
    captain_id: int
    max_team_size: int
    members: list[TeamMemberOut]
    submission: TeamSubmissionSummary | None
    created_at: ApiDateTime


class InvitationCreate(BaseModel):
    expires_in_hours: int = Field(default=72, ge=1, le=336)


class InvitationCreatedOut(BaseModel):
    id: int
    team_id: int
    token: str
    expires_at: ApiDateTime


class InvitationOut(BaseModel):
    id: int
    status: str
    created_at: ApiDateTime
    expires_at: ApiDateTime
    created_by_name: str | None
    accepted_by_name: str | None
    accepted_at: ApiDateTime | None


class InvitationPreviewOut(BaseModel):
    status: str
    expires_at: ApiDateTime
    team_id: int
    team_name: str
    member_count: int
    max_team_size: int
    event_id: int
    event_name: str
    invited_by_name: str | None

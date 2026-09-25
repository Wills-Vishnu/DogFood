from typing import Annotated

from fastapi import APIRouter, Path, Response

from app.api.deps import CurrentUser, DbSession
from app.api.v1.serializers import invitation_out, team_out
from app.core.clock import utcnow
from app.schemas.teams import (
    InvitationCreate,
    InvitationCreatedOut,
    InvitationOut,
    InvitationPreviewOut,
    TeamCreate,
    TeamOut,
    TeamUpdate,
)
from app.services import events as event_service
from app.services import teams as team_service

router = APIRouter(tags=["teams"])

InvitationToken = Annotated[str, Path(min_length=16, max_length=128)]


@router.post("/events/{event_id}/teams", response_model=TeamOut, status_code=201)
def create_team(event_id: int, payload: TeamCreate, user: CurrentUser, db: DbSession):
    event = event_service.get_visible_event(db, event_id, user)
    return team_out(team_service.create_team(db, user, event, payload.name))


@router.get("/events/{event_id}/my-team", response_model=TeamOut | None)
def get_my_team(event_id: int, user: CurrentUser, db: DbSession):
    event = event_service.get_visible_event(db, event_id, user)
    team = team_service.get_my_team(db, user, event.id)
    return team_out(team) if team else None


@router.get("/teams/{team_id}", response_model=TeamOut)
def get_team(team_id: int, user: CurrentUser, db: DbSession):
    return team_out(team_service.get_team_for_viewer(db, team_id, user))


@router.patch("/teams/{team_id}", response_model=TeamOut)
def rename_team(team_id: int, payload: TeamUpdate, user: CurrentUser, db: DbSession):
    team = team_service.get_team_for_viewer(db, team_id, user)
    return team_out(team_service.rename_team(db, team, user, payload.name))


@router.post("/teams/{team_id}/leave", status_code=204)
def leave_team(team_id: int, user: CurrentUser, db: DbSession) -> Response:
    team = team_service.get_team_for_viewer(db, team_id, user)
    team_service.leave_team(db, team, user)
    return Response(status_code=204)


@router.post("/teams/{team_id}/invitations", response_model=InvitationCreatedOut, status_code=201)
def create_invitation(team_id: int, payload: InvitationCreate, user: CurrentUser, db: DbSession):
    team = team_service.get_team_for_viewer(db, team_id, user)
    token, invitation = team_service.create_invitation(db, team, user, payload.expires_in_hours)
    return InvitationCreatedOut(id=invitation.id, team_id=team.id, token=token, expires_at=invitation.expires_at)


@router.get("/teams/{team_id}/invitations", response_model=list[InvitationOut])
def list_invitations(team_id: int, user: CurrentUser, db: DbSession):
    team = team_service.get_team_for_viewer(db, team_id, user)
    now = utcnow()
    return [invitation_out(item, now) for item in team_service.list_invitations(db, team, user)]


@router.delete("/teams/{team_id}/invitations/{invitation_id}", response_model=InvitationOut)
def revoke_invitation(team_id: int, invitation_id: int, user: CurrentUser, db: DbSession):
    team = team_service.get_team_for_viewer(db, team_id, user)
    return invitation_out(team_service.revoke_invitation(db, team, user, invitation_id), utcnow())


@router.get("/invitations/{token}", response_model=InvitationPreviewOut)
def preview_invitation(token: InvitationToken, db: DbSession):
    invitation = team_service.get_invitation_by_token(db, token)
    team = invitation.team
    return InvitationPreviewOut(
        status=invitation.status(utcnow()),
        expires_at=invitation.expires_at,
        team_id=team.id,
        team_name=team.name,
        member_count=len(team.members),
        max_team_size=team.event.max_team_size,
        event_id=team.event_id,
        event_name=team.event.name,
        invited_by_name=invitation.created_by.display_name if invitation.created_by else None,
    )


@router.post("/invitations/{token}/accept", response_model=TeamOut)
def accept_invitation(token: InvitationToken, user: CurrentUser, db: DbSession):
    return team_out(team_service.accept_invitation(db, user, token))

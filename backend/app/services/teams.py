from datetime import timedelta

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.clock import utcnow
from app.core.errors import ConflictError, GoneError, NotFoundError, PermissionDeniedError
from app.core.security import hash_token, new_token
from app.models import Event, Team, TeamInvitation, TeamMember, User
from app.services.common import commit_or_conflict
from app.services.events import can_manage_event, ensure_before_deadline
from app.services.registrations import (
    add_registration,
    ensure_participant,
    get_registration,
    require_registration,
    team_id_for,
)

_TEAM_LOAD_OPTIONS = (
    joinedload(Team.event),
    selectinload(Team.members),
    selectinload(Team.submission),
)

_INVITATION_UNAVAILABLE = {
    "expired": "This invitation has expired",
    "accepted": "This invitation has already been used",
    "revoked": "This invitation has been revoked",
}


def get_team(db: Session, team_id: int) -> Team:
    team = db.scalar(select(Team).where(Team.id == team_id).options(*_TEAM_LOAD_OPTIONS))
    if team is None:
        raise NotFoundError("Team not found")
    return team


def is_member(team: Team, user_id: int) -> bool:
    return any(member.user_id == user_id for member in team.members)


def require_member(team: Team, user: User) -> None:
    if not is_member(team, user.id):
        raise PermissionDeniedError("Only members of this team can do this", code="not_team_member")


def require_captain(team: Team, user: User) -> None:
    if team.captain_id != user.id:
        raise PermissionDeniedError("Only the team captain can do this", code="captain_only")


def get_team_for_viewer(db: Session, team_id: int, user: User) -> Team:
    team = get_team(db, team_id)
    if not is_member(team, user.id) and not can_manage_event(user, team.event):
        raise PermissionDeniedError("You are not a member of this team", code="not_team_member")
    return team


def get_my_team(db: Session, user: User, event_id: int) -> Team | None:
    team_id = team_id_for(db, user.id, event_id)
    return get_team(db, team_id) if team_id is not None else None


def list_event_teams(db: Session, event: Event) -> list[Team]:
    stmt = select(Team).where(Team.event_id == event.id).options(*_TEAM_LOAD_OPTIONS).order_by(Team.created_at)
    return list(db.scalars(stmt))


def _ensure_name_available(db: Session, event_id: int, name: str, exclude_team_id: int | None = None) -> None:
    stmt = select(Team.id).where(Team.event_id == event_id, func.lower(Team.name) == name.lower())
    if exclude_team_id is not None:
        stmt = stmt.where(Team.id != exclude_team_id)
    if db.scalar(stmt) is not None:
        raise ConflictError("That team name is already taken", code="team_name_taken", fields={"name": "Already taken"})


def create_team(db: Session, user: User, event: Event, name: str) -> Team:
    ensure_participant(user)
    require_registration(db, user, event)
    ensure_before_deadline(event)
    if team_id_for(db, user.id, event.id) is not None:
        raise ConflictError("You are already on a team for this event", code="already_in_team")
    _ensure_name_available(db, event.id, name)
    team = Team(event_id=event.id, name=name, captain_id=user.id)
    team.members.append(TeamMember(event_id=event.id, user_id=user.id))
    db.add(team)
    commit_or_conflict(db, "That team name is taken or you already have a team", code="team_conflict")
    return get_team(db, team.id)


def rename_team(db: Session, team: Team, user: User, name: str) -> Team:
    require_captain(team, user)
    ensure_before_deadline(team.event)
    _ensure_name_available(db, team.event_id, name, exclude_team_id=team.id)
    team.name = name
    commit_or_conflict(db, "That team name is already taken", code="team_name_taken")
    return get_team(db, team.id)


def leave_team(db: Session, team: Team, user: User) -> None:
    require_member(team, user)
    ensure_before_deadline(team.event)
    if team.captain_id == user.id:
        raise ConflictError("The team captain cannot leave the team", code="captain_cannot_leave")
    membership = next(member for member in team.members if member.user_id == user.id)
    team.members.remove(membership)
    db.commit()


def create_invitation(db: Session, team: Team, user: User, expires_in_hours: int) -> tuple[str, TeamInvitation]:
    require_captain(team, user)
    ensure_before_deadline(team.event)
    if len(team.members) >= team.event.max_team_size:
        raise ConflictError("Your team is already full", code="team_full")
    token = new_token()
    invitation = TeamInvitation(
        team_id=team.id,
        token_hash=hash_token(token),
        created_by_id=user.id,
        expires_at=utcnow() + timedelta(hours=expires_in_hours),
    )
    db.add(invitation)
    db.commit()
    return token, invitation


def list_invitations(db: Session, team: Team, user: User) -> list[TeamInvitation]:
    require_member(team, user)
    stmt = (
        select(TeamInvitation)
        .where(TeamInvitation.team_id == team.id)
        .options(joinedload(TeamInvitation.created_by), joinedload(TeamInvitation.accepted_by))
        .order_by(TeamInvitation.created_at.desc())
    )
    return list(db.scalars(stmt))


def revoke_invitation(db: Session, team: Team, user: User, invitation_id: int) -> TeamInvitation:
    require_captain(team, user)
    invitation = db.scalar(
        select(TeamInvitation).where(TeamInvitation.id == invitation_id, TeamInvitation.team_id == team.id)
    )
    if invitation is None:
        raise NotFoundError("Invitation not found")
    now = utcnow()
    if invitation.status(now) == "active":
        invitation.revoked_at = now
        db.commit()
    return invitation


def get_invitation_by_token(db: Session, token: str) -> TeamInvitation:
    invitation = db.scalar(
        select(TeamInvitation)
        .where(TeamInvitation.token_hash == hash_token(token))
        .options(
            joinedload(TeamInvitation.team).options(*_TEAM_LOAD_OPTIONS),
            joinedload(TeamInvitation.created_by),
        )
    )
    if invitation is None:
        raise NotFoundError("Invitation not found", code="invitation_not_found")
    return invitation


def accept_invitation(db: Session, user: User, token: str) -> Team:
    invitation = get_invitation_by_token(db, token)
    now = utcnow()
    status = invitation.status(now)
    if status != "active":
        raise GoneError(_INVITATION_UNAVAILABLE[status], code=f"invitation_{status}")
    ensure_participant(user)

    # Row lock serialises concurrent acceptances so the team size limit holds on MySQL.
    team = db.scalar(select(Team).where(Team.id == invitation.team_id).with_for_update())
    event = invitation.team.event
    ensure_before_deadline(event)

    current_team_id = team_id_for(db, user.id, event.id)
    if current_team_id == team.id:
        raise ConflictError("You are already a member of this team", code="already_member")
    if current_team_id is not None:
        raise ConflictError("You are already on another team for this event", code="already_in_team")
    member_count = db.scalar(select(func.count()).select_from(TeamMember).where(TeamMember.team_id == team.id))
    if member_count >= event.max_team_size:
        raise ConflictError("This team is already full", code="team_full")
    if get_registration(db, user.id, event.id) is None:
        add_registration(db, user, event)

    claimed = db.execute(
        update(TeamInvitation)
        .where(
            TeamInvitation.id == invitation.id,
            TeamInvitation.accepted_at.is_(None),
            TeamInvitation.revoked_at.is_(None),
        )
        .values(accepted_at=now, accepted_by_id=user.id)
        .execution_options(synchronize_session=False)
    )
    if claimed.rowcount != 1:
        db.rollback()
        raise GoneError(_INVITATION_UNAVAILABLE["accepted"], code="invitation_accepted")
    db.add(TeamMember(team_id=team.id, event_id=event.id, user_id=user.id))
    commit_or_conflict(db, "You are already on a team for this event", code="already_in_team")
    db.expire_all()
    return get_team(db, team.id)

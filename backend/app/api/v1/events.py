from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession, OptionalUser, OrganizerUser
from app.api.v1.serializers import events_out, submission_row_out, team_out
from app.core.clock import utcnow
from app.schemas.events import (
    EventCreate,
    EventDetailOut,
    EventOut,
    EventUpdate,
    EventViewerOut,
    RegistrationOut,
    RegistrationRowOut,
)
from app.schemas.submissions import SubmissionRowOut
from app.schemas.teams import TeamOut
from app.services import events as event_service
from app.services import registrations as registration_service
from app.services import submissions as submission_service
from app.services import teams as team_service

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventOut])
def list_events(db: DbSession):
    return events_out(db, event_service.list_published_events(db))


@router.get("/manage", response_model=list[EventOut])
def list_managed_events(user: OrganizerUser, db: DbSession):
    return events_out(db, event_service.list_managed_events(db, user))


@router.post("", response_model=EventOut, status_code=201)
def create_event(payload: EventCreate, user: OrganizerUser, db: DbSession):
    event = event_service.create_event(db, user, payload)
    return events_out(db, [event])[0]


@router.get("/{event_id}", response_model=EventDetailOut)
def get_event(event_id: int, user: OptionalUser, db: DbSession):
    event = event_service.get_visible_event(db, event_id, user)
    registration = registration_service.get_registration(db, user.id, event.id) if user else None
    viewer = EventViewerOut(
        is_authenticated=user is not None,
        is_registered=registration is not None,
        can_manage=event_service.can_manage_event(user, event),
        team_id=registration_service.team_id_for(db, user.id, event.id) if user else None,
    )
    return EventDetailOut(**events_out(db, [event])[0].model_dump(), viewer=viewer)


@router.patch("/{event_id}", response_model=EventOut)
def update_event(event_id: int, payload: EventUpdate, user: CurrentUser, db: DbSession):
    event = event_service.get_managed_event(db, event_id, user)
    return events_out(db, [event_service.update_event(db, event, payload)])[0]


@router.post("/{event_id}/registration", response_model=RegistrationOut, status_code=201)
def register_for_event(event_id: int, user: CurrentUser, db: DbSession):
    event = event_service.get_visible_event(db, event_id, user)
    registration = registration_service.register(db, user, event)
    return RegistrationOut(event_id=event.id, registered_at=registration.created_at, team_id=None)


@router.get("/{event_id}/registration", response_model=RegistrationOut | None)
def get_my_registration(event_id: int, user: CurrentUser, db: DbSession):
    event = event_service.get_visible_event(db, event_id, user)
    registration = registration_service.get_registration(db, user.id, event.id)
    if registration is None:
        return None
    return RegistrationOut(
        event_id=event.id,
        registered_at=registration.created_at,
        team_id=registration_service.team_id_for(db, user.id, event.id),
    )


@router.get("/{event_id}/registrations", response_model=list[RegistrationRowOut])
def list_registrations(event_id: int, user: CurrentUser, db: DbSession):
    event = event_service.get_managed_event(db, event_id, user)
    teams = {member.user_id: team for team in team_service.list_event_teams(db, event) for member in team.members}
    return [
        RegistrationRowOut(
            user_id=registration.user_id,
            display_name=registration.user.display_name,
            email=registration.user.email,
            registered_at=registration.created_at,
            team_id=teams[registration.user_id].id if registration.user_id in teams else None,
            team_name=teams[registration.user_id].name if registration.user_id in teams else None,
        )
        for registration in registration_service.list_event_registrations(db, event)
    ]


@router.get("/{event_id}/teams", response_model=list[TeamOut])
def list_teams(event_id: int, user: CurrentUser, db: DbSession):
    event = event_service.get_managed_event(db, event_id, user)
    now = utcnow()
    return [team_out(team, now) for team in team_service.list_event_teams(db, event)]


@router.get("/{event_id}/submissions", response_model=list[SubmissionRowOut])
def list_submissions(event_id: int, user: CurrentUser, db: DbSession):
    event = event_service.get_managed_event(db, event_id, user)
    now = utcnow()
    return [submission_row_out(item, now) for item in submission_service.list_event_submissions(db, event)]

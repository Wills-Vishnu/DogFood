from fastapi import APIRouter, UploadFile

from app.api.deps import CurrentUser, DbSession
from app.api.v1.serializers import events_out, submission_summary, team_out
from app.core.clock import utcnow
from app.schemas.me import MyEventOut
from app.schemas.submissions import UploadOut
from app.services import registrations as registration_service
from app.services import teams as team_service
from app.services.uploads import save_image

router = APIRouter(tags=["me"])


@router.get("/me/events", response_model=list[MyEventOut])
def list_my_events(user: CurrentUser, db: DbSession):
    registrations = registration_service.list_my_registrations(db, user)
    events = events_out(db, [registration.event for registration in registrations])
    now = utcnow()
    result = []
    for registration, event in zip(registrations, events, strict=True):
        team = team_service.get_my_team(db, user, registration.event_id)
        result.append(
            MyEventOut(
                event=event,
                registered_at=registration.created_at,
                team=team_out(team, now) if team else None,
                submission=submission_summary(team.submission, now) if team else None,
            )
        )
    return result


@router.post("/uploads/images", response_model=UploadOut, status_code=201, tags=["uploads"])
async def upload_image(file: UploadFile, _user: CurrentUser):
    return UploadOut(url=await save_image(file))

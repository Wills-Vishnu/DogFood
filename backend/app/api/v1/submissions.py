from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.api.v1.serializers import submission_out
from app.schemas.submissions import SubmissionOut, SubmissionUpdate
from app.services import submissions as submission_service
from app.services import teams as team_service

router = APIRouter(tags=["submissions"])


@router.get("/teams/{team_id}/submission", response_model=SubmissionOut | None)
def get_team_submission(team_id: int, user: CurrentUser, db: DbSession):
    team = team_service.get_team_for_viewer(db, team_id, user)
    submission = submission_service.get_team_submission(db, team)
    return submission_out(submission) if submission else None


@router.post("/teams/{team_id}/submission", response_model=SubmissionOut, status_code=201)
def create_submission(team_id: int, user: CurrentUser, db: DbSession):
    team = team_service.get_team_for_viewer(db, team_id, user)
    return submission_out(submission_service.create_submission(db, team, user))


@router.get("/submissions/{submission_id}", response_model=SubmissionOut)
def get_submission(submission_id: int, user: CurrentUser, db: DbSession):
    return submission_out(submission_service.get_submission_for_viewer(db, submission_id, user))


@router.patch("/submissions/{submission_id}", response_model=SubmissionOut)
def update_submission(submission_id: int, payload: SubmissionUpdate, user: CurrentUser, db: DbSession):
    submission = submission_service.get_submission_for_viewer(db, submission_id, user)
    return submission_out(submission_service.update_submission(db, submission, user, payload))


@router.post("/submissions/{submission_id}/submit", response_model=SubmissionOut)
def submit_submission(submission_id: int, user: CurrentUser, db: DbSession):
    submission = submission_service.get_submission_for_viewer(db, submission_id, user)
    return submission_out(submission_service.submit_submission(db, submission, user))

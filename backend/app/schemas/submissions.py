from pydantic import BaseModel, Field

from app.schemas.common import ApiDateTime, MediaUrl, WebUrl, text


class AnswerIn(BaseModel):
    question_id: int
    answer: str = Field(max_length=10_000)


class SubmissionUpdate(BaseModel):
    """Only fields present in the request are applied. List fields replace the stored values."""

    title: text(150) | None = None
    tagline: text(300) | None = None
    description: text(20_000) | None = None
    thumbnail_url: MediaUrl = None
    demo_video_url: WebUrl = None
    repo_url: WebUrl = None
    live_url: WebUrl = None
    track_id: int | None = None
    tags: list[text(50)] | None = Field(default=None, max_length=20)
    images: list[MediaUrl] | None = Field(default=None, max_length=10)
    answers: list[AnswerIn] | None = Field(default=None, max_length=50)


class AnswerOut(BaseModel):
    question_id: int
    answer: str


class SubmissionOut(BaseModel):
    id: int
    event_id: int
    event_name: str
    team_id: int
    team_name: str
    title: str
    tagline: str
    description: str
    thumbnail_url: str | None
    demo_video_url: str | None
    repo_url: str | None
    live_url: str | None
    track_id: int | None
    track_name: str | None
    tags: list[str]
    images: list[str]
    answers: list[AnswerOut]
    status: str
    state: str
    is_editable: bool
    deadline: ApiDateTime
    server_time: ApiDateTime
    missing_fields: dict[str, str]
    submitted_at: ApiDateTime | None
    created_at: ApiDateTime
    updated_at: ApiDateTime


class SubmissionRowOut(BaseModel):
    id: int
    title: str
    team_id: int
    team_name: str
    track_name: str | None
    status: str
    state: str
    submitted_at: ApiDateTime | None
    updated_at: ApiDateTime


class UploadOut(BaseModel):
    url: str

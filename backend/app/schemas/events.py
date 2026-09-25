from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints

from app.schemas.common import ApiDateTime, ORMModel, WebUrl, optional_text, text

Slug = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        to_lower=True,
        min_length=3,
        max_length=120,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    ),
]


class TrackIn(BaseModel):
    id: int | None = None
    name: text(100, min_length=1)
    description: optional_text(500) = None


class PrizeIn(BaseModel):
    id: int | None = None
    name: text(150, min_length=1)
    description: optional_text(500) = None
    amount: int | None = Field(default=None, ge=0, le=100_000_000)


class QuestionIn(BaseModel):
    id: int | None = None
    prompt: text(500, min_length=1)
    help_text: optional_text(500) = None
    is_required: bool = False
    max_length: int = Field(default=2000, ge=1, le=10_000)


class EventCreate(BaseModel):
    name: text(200, min_length=1)
    slug: Slug | None = None
    description: text(20_000) = ""
    rules: optional_text(20_000) = None
    location: optional_text(200) = None
    website_url: WebUrl = None
    registration_opens_at: ApiDateTime | None = None
    registration_closes_at: ApiDateTime | None = None
    starts_at: ApiDateTime
    ends_at: ApiDateTime
    submission_deadline: ApiDateTime
    max_team_size: int = Field(default=4, ge=1, le=20)
    is_published: bool = False
    tracks: list[TrackIn] = Field(default_factory=list, max_length=25)
    prizes: list[PrizeIn] = Field(default_factory=list, max_length=25)
    questions: list[QuestionIn] = Field(default_factory=list, max_length=25)


class EventUpdate(BaseModel):
    """Only fields present in the request are applied; child lists are synced by id."""

    name: text(200, min_length=1) | None = None
    slug: Slug | None = None
    description: text(20_000) | None = None
    rules: optional_text(20_000) = None
    location: optional_text(200) = None
    website_url: WebUrl = None
    registration_opens_at: ApiDateTime | None = None
    registration_closes_at: ApiDateTime | None = None
    starts_at: ApiDateTime | None = None
    ends_at: ApiDateTime | None = None
    submission_deadline: ApiDateTime | None = None
    max_team_size: int | None = Field(default=None, ge=1, le=20)
    is_published: bool | None = None
    tracks: list[TrackIn] | None = Field(default=None, max_length=25)
    prizes: list[PrizeIn] | None = Field(default=None, max_length=25)
    questions: list[QuestionIn] | None = Field(default=None, max_length=25)


class TrackOut(ORMModel):
    id: int
    name: str
    description: str | None


class PrizeOut(ORMModel):
    id: int
    name: str
    description: str | None
    amount: int | None


class QuestionOut(ORMModel):
    id: int
    prompt: str
    help_text: str | None
    is_required: bool
    max_length: int


class PersonOut(BaseModel):
    id: int
    display_name: str


class EventOut(BaseModel):
    id: int
    slug: str
    name: str
    description: str
    rules: str | None
    location: str | None
    website_url: str | None
    registration_opens_at: ApiDateTime | None
    registration_closes_at: ApiDateTime | None
    starts_at: ApiDateTime
    ends_at: ApiDateTime
    submission_deadline: ApiDateTime
    max_team_size: int
    is_published: bool
    published_at: ApiDateTime | None
    phase: str
    registration_open: bool
    submissions_open: bool
    tracks: list[TrackOut]
    prizes: list[PrizeOut]
    questions: list[QuestionOut]
    organizer: PersonOut
    participant_count: int
    team_count: int
    submission_count: int
    server_time: ApiDateTime
    created_at: ApiDateTime
    updated_at: ApiDateTime


class EventViewerOut(BaseModel):
    is_authenticated: bool
    is_registered: bool
    can_manage: bool
    team_id: int | None


class EventDetailOut(EventOut):
    viewer: EventViewerOut


class RegistrationOut(BaseModel):
    event_id: int
    registered_at: ApiDateTime
    team_id: int | None


class RegistrationRowOut(BaseModel):
    user_id: int
    display_name: str
    email: str
    registered_at: ApiDateTime
    team_id: int | None
    team_name: str | None

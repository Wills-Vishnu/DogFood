from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.clock import utcnow
from app.db.base import Base, UTCDateTime
from app.models.user import User


class EventTrack(Base):
    __tablename__ = "event_tracks"
    __table_args__ = (UniqueConstraint("event_id", "name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class EventPrize(Base):
    __tablename__ = "event_prizes"

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(150))
    description: Mapped[str | None] = mapped_column(String(500))
    amount: Mapped[int | None] = mapped_column(Integer)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class SubmissionQuestion(Base):
    __tablename__ = "submission_questions"

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), index=True)
    prompt: Mapped[str] = mapped_column(String(500))
    help_text: Mapped[str | None] = mapped_column(String(500))
    is_required: Mapped[bool] = mapped_column(Boolean, default=False)
    max_length: Mapped[int] = mapped_column(Integer, default=2000)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    rules: Mapped[str | None] = mapped_column(Text)
    location: Mapped[str | None] = mapped_column(String(200))
    website_url: Mapped[str | None] = mapped_column(String(500))
    registration_opens_at: Mapped[datetime | None] = mapped_column(UTCDateTime)
    registration_closes_at: Mapped[datetime | None] = mapped_column(UTCDateTime)
    starts_at: Mapped[datetime] = mapped_column(UTCDateTime)
    ends_at: Mapped[datetime] = mapped_column(UTCDateTime)
    submission_deadline: Mapped[datetime] = mapped_column(UTCDateTime)
    max_team_size: Mapped[int] = mapped_column(Integer, default=4)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    published_at: Mapped[datetime | None] = mapped_column(UTCDateTime)
    organizer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow, onupdate=utcnow)

    organizer: Mapped[User] = relationship()
    tracks: Mapped[list[EventTrack]] = relationship(
        order_by=[EventTrack.sort_order, EventTrack.id], cascade="all, delete-orphan", passive_deletes=True
    )
    prizes: Mapped[list[EventPrize]] = relationship(
        order_by=[EventPrize.sort_order, EventPrize.id], cascade="all, delete-orphan", passive_deletes=True
    )
    questions: Mapped[list[SubmissionQuestion]] = relationship(
        order_by=[SubmissionQuestion.sort_order, SubmissionQuestion.id],
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class EventRegistration(Base):
    __tablename__ = "event_registrations"
    __table_args__ = (UniqueConstraint("event_id", "user_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)

    event: Mapped[Event] = relationship()
    user: Mapped[User] = relationship()

from datetime import datetime
from enum import StrEnum

from sqlalchemy import ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.clock import utcnow
from app.db.base import Base, UTCDateTime
from app.models.event import Event, EventTrack
from app.models.team import Team


class SubmissionStatus(StrEnum):
    DRAFT = "draft"
    SUBMITTED = "submitted"


class SubmissionImage(Base):
    __tablename__ = "submission_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    submission_id: Mapped[int] = mapped_column(ForeignKey("submissions.id", ondelete="CASCADE"), index=True)
    url: Mapped[str] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class SubmissionTag(Base):
    __tablename__ = "submission_tags"
    __table_args__ = (UniqueConstraint("submission_id", "tag"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    submission_id: Mapped[int] = mapped_column(ForeignKey("submissions.id", ondelete="CASCADE"))
    tag: Mapped[str] = mapped_column(String(50), index=True)


class SubmissionAnswer(Base):
    __tablename__ = "submission_answers"
    __table_args__ = (UniqueConstraint("submission_id", "question_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    submission_id: Mapped[int] = mapped_column(ForeignKey("submissions.id", ondelete="CASCADE"))
    question_id: Mapped[int] = mapped_column(
        ForeignKey("submission_questions.id", ondelete="CASCADE"), index=True
    )
    answer: Mapped[str] = mapped_column(Text)


class Submission(Base):
    __tablename__ = "submissions"
    __table_args__ = (Index("ix_submissions_status_submitted_at", "status", "submitted_at"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), index=True)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), unique=True)
    title: Mapped[str] = mapped_column(String(150), default="")
    tagline: Mapped[str] = mapped_column(String(300), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    thumbnail_url: Mapped[str | None] = mapped_column(String(500))
    demo_video_url: Mapped[str | None] = mapped_column(String(500))
    repo_url: Mapped[str | None] = mapped_column(String(500))
    live_url: Mapped[str | None] = mapped_column(String(500))
    track_id: Mapped[int | None] = mapped_column(ForeignKey("event_tracks.id", ondelete="SET NULL"), index=True)
    status: Mapped[str] = mapped_column(String(20), default=SubmissionStatus.DRAFT.value)
    submitted_at: Mapped[datetime | None] = mapped_column(UTCDateTime)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow, onupdate=utcnow)

    event: Mapped[Event] = relationship()
    team: Mapped[Team] = relationship(back_populates="submission")
    track: Mapped[EventTrack | None] = relationship()
    images: Mapped[list[SubmissionImage]] = relationship(
        order_by=[SubmissionImage.sort_order, SubmissionImage.id],
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    tags: Mapped[list[SubmissionTag]] = relationship(
        order_by=SubmissionTag.id, cascade="all, delete-orphan", passive_deletes=True
    )
    answers: Mapped[list[SubmissionAnswer]] = relationship(
        order_by=SubmissionAnswer.question_id, cascade="all, delete-orphan", passive_deletes=True
    )

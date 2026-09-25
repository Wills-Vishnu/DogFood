from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.clock import utcnow
from app.db.base import Base, UTCDateTime
from app.models.event import Event
from app.models.user import User

if TYPE_CHECKING:
    from app.models.submission import Submission


class TeamMember(Base):
    __tablename__ = "team_members"
    # event_id is denormalised from the team so the database guarantees one team per user per event.
    __table_args__ = (UniqueConstraint("event_id", "user_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), index=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    joined_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)

    team: Mapped["Team"] = relationship(back_populates="members")
    user: Mapped[User] = relationship(lazy="joined")


class TeamInvitation(Base):
    __tablename__ = "team_invitations"

    id: Mapped[int] = mapped_column(primary_key=True)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    created_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)
    expires_at: Mapped[datetime] = mapped_column(UTCDateTime)
    accepted_at: Mapped[datetime | None] = mapped_column(UTCDateTime)
    accepted_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    revoked_at: Mapped[datetime | None] = mapped_column(UTCDateTime)

    team: Mapped["Team"] = relationship(back_populates="invitations")
    created_by: Mapped[User | None] = relationship(foreign_keys=[created_by_id])
    accepted_by: Mapped[User | None] = relationship(foreign_keys=[accepted_by_id])

    def status(self, now: datetime) -> str:
        if self.revoked_at is not None:
            return "revoked"
        if self.accepted_at is not None:
            return "accepted"
        if now >= self.expires_at:
            return "expired"
        return "active"


class Team(Base):
    __tablename__ = "teams"
    __table_args__ = (UniqueConstraint("event_id", "name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(100))
    captain_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow, onupdate=utcnow)

    event: Mapped[Event] = relationship()
    captain: Mapped[User] = relationship(foreign_keys=[captain_id])
    members: Mapped[list[TeamMember]] = relationship(
        back_populates="team",
        order_by=[TeamMember.joined_at, TeamMember.id],
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    invitations: Mapped[list[TeamInvitation]] = relationship(
        back_populates="team",
        order_by=TeamInvitation.created_at.desc(),
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    submission: Mapped["Submission | None"] = relationship(back_populates="team", passive_deletes=True)

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class TeamMember(Base):

    __tablename__ = "TeamMember"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    TeamId = Column(String(36), ForeignKey("Team.Id", ondelete="CASCADE"), nullable=False)
    UserId = Column(String(36), ForeignKey("User.Id", ondelete="CASCADE"), nullable=False)
    Role = Column(String(50))
    IsLeader = Column(Boolean, default=False)
    JoinedDate = Column(DateTime, default=datetime.now())
    IsActive = Column(Boolean, default=True)

    Team = relationship(
        "Team",
        back_populates="TeamMemberships",
        overlaps="Members,Teams"
    )
    User = relationship(
        "User",
        back_populates="TeamMemberships",
        overlaps="Teams,Members"
    )

    __table_args__ = (
        {"sqlite_autoincrement": True},
    )

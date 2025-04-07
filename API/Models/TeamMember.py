
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

    # "Team Lead", "Developer", etc.
    Role = Column(String(50))
    IsLeader = Column(Boolean, default=False)
    JoinedDate = Column(DateTime, default=datetime.utcnow)
    IsActive = Column(Boolean, default=True)

    # Relationships
    Team = relationship("Team", back_populates="TeamMemberships")
    User = relationship("User", back_populates="TeamMemberships")

      # unique user per team
    __table_args__ = (
        {"sqlite_autoincrement": True},
    )
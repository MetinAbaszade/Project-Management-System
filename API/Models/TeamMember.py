import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class TeamMember(Base):
    __tablename__ = "TeamMember"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    TeamId = Column(String(36), ForeignKey("Team.Id", ondelete="CASCADE"), nullable=False)
    UserId = Column(String(36), ForeignKey("User.Id", ondelete="CASCADE"), nullable=False)
    RoleId = Column(String(36), ForeignKey("Role.Id", ondelete="CASCADE"), nullable=False)
    JoinedAt = Column(DateTime, default=datetime.utcnow)

    # Relationships
    Team = relationship("Team", back_populates="TeamMember")
    User = relationship("User", back_populates="TeamMember")
    Role = relationship("Role", back_populates="TeamMember")

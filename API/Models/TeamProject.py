import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class TeamProject(Base):

    __tablename__ = "TeamProject"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    TeamId = Column(String(36), ForeignKey("Team.Id", ondelete="CASCADE"), nullable=False)
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)

    # Relationships
    Team = relationship("Team", back_populates="TeamProjects")
    Project = relationship("Project", back_populates="TeamProjects")

    # Unique team-project pair
    __table_args__ = (
        {"sqlite_autoincrement": True},
    )
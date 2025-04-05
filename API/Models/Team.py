import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class Team(Base):
    __tablename__ = "Team"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False)
    Name = Column(String(100), nullable=False)
    Description = Column(Text)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    IsDeleted = Column(Boolean, default=False)

    # Relationships
    Project = relationship("Project", back_populates="Team")
    TeamMember = relationship("TeamMember", back_populates="Team", cascade="all, delete-orphan")
    Task = relationship("Task", back_populates="Team", cascade="all, delete-orphan")

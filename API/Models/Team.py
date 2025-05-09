import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class Team(Base):
    __tablename__ = "Team"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Name = Column(String(100), nullable=False)
    Description = Column(Text)
    ColorIndex = Column(Integer, default=0)  # For frontend usage
    CreatedAt = Column(DateTime, default=datetime.now())
    UpdatedAt = Column(DateTime, onupdate=datetime.now())
    CreatedBy = Column(String(36), ForeignKey("User.Id"), nullable=False)
    ProjectId = Column(String(36), ForeignKey("Project.Id"), nullable=False)
    IsDeleted = Column(Boolean, default=False)

    # Relationships
    Tasks = relationship("Task", back_populates="Team", overlaps="Team,TasksAssigned")  # <- resolve Task overlap
    Members = relationship(
        "User",
        secondary="TeamMember",
        back_populates="Teams",
        overlaps="TeamMemberships,User"
    )
    TeamMemberships = relationship(
        "TeamMember",
        back_populates="Team",
        cascade="all, delete-orphan",
        overlaps="Members,User"
    )
    Creator = relationship(
        "User",
        foreign_keys=[CreatedBy],
        back_populates="TeamsCreated",
        overlaps="Members,TeamMemberships"
    )
    Project = relationship("Project", back_populates="Teams")

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from Db.session import Base

class User(Base):
    __tablename__ = "User"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    FirstName = Column(String(50), nullable=False)
    LastName = Column(String(50), nullable=False)
    Email = Column(String(100), nullable=False, unique=True)
    Password = Column(String(255), nullable=False)
    Role = Column(String(50), default="User")
    JobTitle = Column(String(100))
    ProfileUrl = Column(String(255), nullable=True)
    LastLogin = Column(DateTime, nullable=True)
    CreatedAt = Column(DateTime, default=datetime.now)
    UpdatedAt = Column(DateTime, onupdate=datetime.now)
    IsDeleted = Column(Boolean, default=False)

    # 🔁 Relationships
    # Teams where user is a member
    Teams = relationship(
        "Team",
        secondary="TeamMember",
        back_populates="Members",
        overlaps="TeamMemberships"
    )

    # Tasks assigned directly to this user (NOT TaskAssignment)
    TasksAssigned = relationship(
        "Task",
        back_populates="User",
        foreign_keys="Task.UserId"
    )

    # Tasks created by this user
    TasksCreated = relationship(
        "Task",
        back_populates="Creator",
        foreign_keys="Task.CreatedBy"
    )

    Notifications = relationship("Notification", back_populates="User")
    Attachments = relationship("Attachment", back_populates="Owner")
    ProjectStakes = relationship("ProjectStakeholder", back_populates="User")

    ProjectsCreated = relationship(
        "Project",
        back_populates="Creator",
        foreign_keys="Project.OwnerId"
    )

    TeamsCreated = relationship(
        "Team",
        back_populates="Creator",
        foreign_keys="Team.CreatedBy"
    )

    TeamMemberships = relationship(
        "TeamMember",
        back_populates="User",
        overlaps="Teams"
    )

    ProjectMemberships = relationship("ProjectMember", back_populates="User")

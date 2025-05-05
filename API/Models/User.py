import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import relationship, validates
from Db.session import Base


class User(Base):

    __tablename__ = "User"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    FirstName = Column(String(50), nullable=False)
    LastName = Column(String(50), nullable=False)
    Email = Column(String(100), nullable=False, unique=True)
    PasswordHash = Column(String(255), nullable=False)
    #role.py sildim
    Role = Column(String(50), default="User")

    #sadece string (Software Engineer, Backend Developer ...)
    JobTitle = Column(String(100))

    ProfileUrl = Column(String(255), nullable=True)
    LastLogin = Column(DateTime, nullable=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, onupdate=datetime.utcnow)
    IsDeleted = Column(Boolean, default=False)

    # Relationships
    Teams = relationship("Team", secondary="TeamMember", back_populates="Members")
    TasksAssigned = relationship("Task", secondary="TaskAssignment", back_populates="AssignedUsers")
    TasksCreated = relationship("Task", foreign_keys="Task.CreatedBy", back_populates="Creator")
    Comments = relationship("Comment", back_populates="User")
    Notifications = relationship("Notification", back_populates="User")
    Attachments = relationship("Attachment", back_populates="UploadedBy")
    ProjectStakes = relationship("ProjectStakeholder", back_populates="User")
    ProjectsCreated = relationship("Project", foreign_keys="Project.CreatedBy", back_populates="Creator")
    TeamsCreated = relationship("Team", foreign_keys="Team.CreatedBy", back_populates="Creator")
    Expenses = relationship("Expense", back_populates="User")
    TeamMemberships = relationship("TeamMember", back_populates="User")
    ProjectMemberships = relationship("ProjectMember", back_populates="User")

    # @validates('Email')
    # def validate_email(self, key, address):
    #     """Validate email format"""
    #     assert '@' in address, "Invalid email address"
    #     return address
    #
    # @property
    # def FullName(self):
    #     """Get user's full name"""
    #     return f"{self.FirstName} {self.LastName}"
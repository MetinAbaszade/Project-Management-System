import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class User(Base):
    __tablename__ = "User"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    FirstName = Column(String(50), nullable=False)
    LastName = Column(String(50), nullable=False)
    Email = Column(String(100), nullable=False, unique=True)
    Password = Column(String(255), nullable=False)
    ImageUrl = Column(String(255))
    IsActive = Column(Boolean, default=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    LastLogin = Column(DateTime)
    ResetToken = Column(String(255))
    ResetTokenExpires = Column(DateTime)
    LoginAttempts = Column(Integer, default=0)
    LastPasswordChange = Column(DateTime)
    RequirePasswordChange = Column(Boolean, default=False)
    IsDeleted = Column(Boolean, default=False)

    # Relationships (note: even though these return collections, we use singular names as requested)
    ProjectOwned = relationship("Project", back_populates="Owner", cascade="all, delete-orphan")
    ProjectMember = relationship("ProjectMember", back_populates="User", cascade="all, delete-orphan")
    TeamMember = relationship("TeamMember", back_populates="User", cascade="all, delete-orphan")
    ChatMessage = relationship("ChatMessage", back_populates="User", cascade="all, delete-orphan")
    TaskAssigned = relationship("Task", secondary="TaskAssignment", back_populates="AssignedUser")
    Comment = relationship("Comment", back_populates="User", cascade="all, delete-orphan")
    Notification = relationship("Notification", back_populates="user")
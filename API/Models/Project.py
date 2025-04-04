import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class Project(Base):
    __tablename__ = "Project"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    OwnerId = Column(String(36), ForeignKey("User.Id", ondelete="CASCADE"), nullable=False)
    Name = Column(String(100), nullable=False)
    Description = Column(Text)
    Budget = Column(Integer, nullable=False, default=0)
    Deadline = Column(DateTime)
    StatusId = Column(String(36), ForeignKey("ProjectStatus.Id", ondelete="CASCADE"), nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    IsDeleted = Column(Boolean, default=False)

    # Relationships (singular names)
    Owner = relationship("User", back_populates="ProjectOwned")
    Task = relationship("Task", back_populates="Project", cascade="all, delete-orphan")
    Team = relationship("Team", back_populates="Project", cascade="all, delete-orphan")
    Expense = relationship("Expense", back_populates="Project", cascade="all, delete-orphan")
    Scope = relationship("Scope", uselist=False, back_populates="Project", cascade="all, delete-orphan")
    Notification = relationship("Notification", back_populates="Project", cascade="all, delete-orphan")
    Comment = relationship("Comment", back_populates="Project", cascade="all, delete-orphan")
    ChatMessage = relationship("ChatMessage", back_populates="Project", cascade="all, delete-orphan")
    ProjectMember = relationship("ProjectMember", back_populates="Project", cascade="all, delete-orphan")
    Stakeholder = relationship("Stakeholder", back_populates="Project", cascade="all, delete-orphan")
    Attachment = relationship("Attachment", back_populates="Project", cascade="all, delete-orphan")
    ProjectStatus = relationship("ProjectStatus", back_populates="Project")

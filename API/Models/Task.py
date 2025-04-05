import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class Task(Base):
    __tablename__ = "Task"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False)
    TeamId = Column(String(36), ForeignKey("Team.Id", ondelete="SET NULL"), nullable=True)
    Title = Column(String(100), nullable=False)
    Description = Column(Text)
    IsSubtask = Column(Boolean, default=False)
    ParentTaskId = Column(String(36), ForeignKey("Task.Id", ondelete="CASCADE"), nullable=True)
    Deadline = Column(DateTime)
    BudgetUsed = Column(Integer, default=0)
    PriorityId = Column(String(36), ForeignKey("TaskPriority.Id", ondelete="CASCADE"), nullable=False)
    StatusId = Column(String(36), ForeignKey("TaskStatus.Id", ondelete="CASCADE"), nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    IsDeleted = Column(Boolean, default=False)

    # Relationships
    Project = relationship("Project", back_populates="Task")
    Team = relationship("Team", back_populates="Task")
    AssignedUser = relationship("User", secondary="TaskAssignment", back_populates="TaskAssigned")
    Subtask = relationship("Task", backref="ParentTask", remote_side=[Id], cascade="all, delete-orphan")
    Comment = relationship("Comment", back_populates="Task", cascade="all, delete-orphan")
    Attachment = relationship("Attachment", back_populates="Task", cascade="all, delete-orphan")
    TaskPriority = relationship("TaskPriority", back_populates="Task")
    TaskStatus = relationship("TaskStatus", back_populates="Task")

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from Models.TaskAssignment import TaskAssignment
from Db.session import Base


class Task(Base):

    __tablename__ = "Task"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False)
    TeamId = Column(String(36), ForeignKey("Team.Id", ondelete="CASCADE"), nullable=True)

    AssignmentTypeId = Column(String(36), ForeignKey("AssignmentType.Id"), nullable=False)
    Title = Column(String(100), nullable=False)
    Description = Column(Text)
    IsSubtask = Column(Boolean, default=False)
    ParentTaskId = Column(String(36), ForeignKey("Task.Id", ondelete="CASCADE"), nullable=True)
    Deadline = Column(DateTime)
    BudgetAllocated = Column(Numeric(12, 2), default=0)
    PriorityId = Column(String(36), ForeignKey("Priority.Id"), nullable=False)
    StatusId = Column(String(36), ForeignKey("Status.Id"), nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, onupdate=datetime.utcnow)
    CreatedBy = Column(String(36), ForeignKey("User.Id"), nullable=False)
    IsDeleted = Column(Boolean, default=False)
    Completed = Column(Boolean, default=False)

    # Relationships
    Project = relationship("Project", back_populates="Tasks")
    Team = relationship("Team", back_populates="Tasks")

    AssignedUsers = relationship(
        "User",
        secondary="TaskAssignment",
        back_populates="TasksAssigned",
        primaryjoin="Task.Id == TaskAssignment.TaskId",
        secondaryjoin="User.Id == TaskAssignment.UserId",
        foreign_keys=[TaskAssignment.TaskId, TaskAssignment.UserId],
        overlaps="TasksAssigned,TaskAssignment,User"
    )

    Subtasks = relationship(
        "Task",
        back_populates="ParentTask",
        cascade="all, delete-orphan",
        single_parent=True
    )

    ParentTask = relationship(
        "Task",
        remote_side=[Id],
        back_populates="Subtasks"
    )

    Comments = relationship("Comment", back_populates="Task", cascade="all, delete-orphan")
    Attachments = relationship("Attachment", back_populates="Task", cascade="all, delete-orphan")
    Priority = relationship("Priority")
    Status = relationship("Status")
    AssignmentType = relationship("AssignmentType")
    Creator = relationship("User", foreign_keys=[CreatedBy], back_populates="TasksCreated", overlaps="TasksAssigned")
    Expenses = relationship("Expense", back_populates="Task", cascade="all, delete-orphan")
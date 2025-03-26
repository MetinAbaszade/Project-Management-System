from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, Float, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base
import enum
from datetime import datetime

# Define enums for priority and status
class TaskPriority(enum.Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"
    Critical = "Critical"

class TaskStatus(enum.Enum):
    Backlog = "Backlog"
    Todo = "Todo"
    InProgress = "InProgress"
    Review = "Review"
    Done = "Done"

class Task(Base):
    __tablename__ = "tasks"

    task_id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    type = Column(Integer, ForeignKey("task_types.type_id"), nullable=True)
    priority = Column(Enum(TaskPriority), default=TaskPriority.Medium)
    status = Column(Enum(TaskStatus), default=TaskStatus.Backlog)
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    assigned_to = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deadline = Column(DateTime)
    estimated_hours = Column(Float)
    actual_hours = Column(Float, default=0)
    budget_used = Column(DECIMAL(10, 2), default=0)
    tags = Column(String(255))
    is_billable = Column(Boolean, default=True)
    completion_percentage = Column(Float, default=0)

    # Relationships (example)
    project = relationship("Project", backref="tasks", foreign_keys=[project_id])
    task_type = relationship("TaskType", foreign_keys=[type])
    creator = relationship("User", foreign_keys=[created_by])
    assignee = relationship("User", foreign_keys=[assigned_to])

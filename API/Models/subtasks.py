from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from Db.session import Base
import enum
from datetime import datetime

class SubtaskStatus(enum.Enum):
    Todo = "Todo"
    InProgress = "InProgress"
    Done = "Done"

class Subtask(Base):
    __tablename__ = "subtasks"

    subtask_id = Column(Integer, primary_key=True, autoincrement=True)
    parent_task_id = Column(Integer, ForeignKey("tasks.task_id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    status = Column(Enum(SubtaskStatus), default=SubtaskStatus.Todo)
    estimated_hours = Column(Float)
    actual_hours = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deadline = Column(DateTime)

    # Relationships
    parent_task = relationship("Task", backref="subtasks", foreign_keys=[parent_task_id])
    assignee = relationship("User", foreign_keys=[assigned_to])

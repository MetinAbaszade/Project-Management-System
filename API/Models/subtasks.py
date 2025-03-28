import uuid
from sqlalchemy import Column, String, Text, DateTime, Float, ForeignKey, Enum
from datetime import datetime
from Db.session import Base
import enum
from sqlalchemy.orm import relationship

class SubtaskStatus(enum.Enum):
    Todo = "Todo"
    InProgress = "InProgress"
    Done = "Done"

class Subtask(Base):
    __tablename__ = "Subtasks"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ParentTaskId = Column(String(36), ForeignKey("Tasks.Id"), nullable=False)
    AssignedTo = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    Title = Column(String(100), nullable=False)
    Description = Column(Text)
    Status = Column(Enum(SubtaskStatus), default=SubtaskStatus.Todo)
    EstimatedHours = Column(Float)
    ActualHours = Column(Float, default=0)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    Deadline = Column(DateTime)

    #test ede bilmedim, error cixsa parent_task a deyis.
    ParentTask = relationship("Task", backref="Subtasks", foreign_keys=[ParentTaskId])
    Assignee = relationship("User", foreign_keys=[AssignedTo])

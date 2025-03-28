import uuid
from sqlalchemy import Column, String, Text, Enum, DateTime, Float, DECIMAL, ForeignKey
from datetime import datetime
from Db.session import Base
import enum
from sqlalchemy.orm import relationship

class TaskPriority(enum.Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"
    Critical = "Critical"

class TaskStatusEnum(enum.Enum):
    Backlog = "Backlog"
    Todo = "Todo"
    InProgress = "InProgress"
    Review = "Review"
    Done = "Done"

class Task(Base):
    __tablename__ = "Tasks"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Projects.Id"), nullable=False)
    Title = Column(String(100), nullable=False)
    Description = Column(Text)
    Type = Column(String(36), ForeignKey("TaskTypes.Id"), nullable=True)
    Priority = Column(Enum(TaskPriority), default=TaskPriority.Medium)
    Status = Column(Enum(TaskStatusEnum), default=TaskStatusEnum.Backlog)
    CreatedBy = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    AssignedTo = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    Deadline = Column(DateTime)
    EstimatedHours = Column(Float)
    ActualHours = Column(Float, default=0)
    BudgetUsed = Column(DECIMAL(10, 2), default=0)
    Tags = Column(String(255))
    IsBillable = Column(Boolean, default=True)
    CompletionPercentage = Column(Float, default=0)


    #relationshipleri yaxsi bilmirem sehv olmus ola biler 
    project = relationship("Project", backref="Tasks", foreign_keys=[ProjectId])
    task_type = relationship("TaskType", foreign_keys=[Type])
    creator = relationship("User", foreign_keys=[CreatedBy])
    assignee = relationship("User", foreign_keys=[AssignedTo])

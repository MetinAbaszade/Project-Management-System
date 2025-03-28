import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from datetime import datetime
from Db.session import Base
from sqlalchemy.orm import relationship

class TaskStatusHistory(Base):
    __tablename__ = "TaskStatusHistory"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    TaskId = Column(String(36), ForeignKey("Tasks.Id"), nullable=False)
    UserId = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    OldStatus = Column(String(20), nullable=False)
    NewStatus = Column(String(20), nullable=False)
    UpdatedAt = Column(DateTime, default=datetime.utcnow)
    Notes = Column(Text)
    TimeInStatus = Column(Integer)
    Task = relationship("Task", backref="StatusHistory", foreign_keys=[TaskId])
    User = relationship("User", foreign_keys=[UserId])

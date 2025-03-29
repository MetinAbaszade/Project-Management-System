import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime
from datetime import datetime
from Db.session import Base

class TaskType(Base):
    __tablename__ = "TaskTypes"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    TypeName = Column(String(50), nullable=False, unique=True)
    Description = Column(String(255))
    Color = Column(String(7))
    Icon = Column(String(50))
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    IsDeleted = Column(Boolean, default=False)
    

import uuid
from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from Db.session import Base


class TaskStatus(Base):
    __tablename__ = "TaskStatus"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Name = Column(String(50), unique=True, nullable=False)
    Description = Column(Text)

    # Relationships
    Task = relationship("Task", back_populates="TaskStatus", cascade="all, delete-orphan")

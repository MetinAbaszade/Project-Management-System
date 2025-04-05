import uuid
from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from Db.session import Base


class TaskPriority(Base):
    __tablename__ = "TaskPriority"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Name = Column(String(50), unique=True, nullable=False)
    Description = Column(Text)

    # Relationships
    Task = relationship("Task", back_populates="TaskPriority", cascade="all, delete-orphan")

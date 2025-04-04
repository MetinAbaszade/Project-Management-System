import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class Comment(Base):
    __tablename__ = "Comment"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=True)
    TaskId = Column(String(36), ForeignKey("Task.Id", ondelete="CASCADE"), nullable=True)
    UserId = Column(String(36), ForeignKey("User.Id", ondelete="CASCADE"), nullable=False)
    Content = Column(Text, nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)

    # Relationships
    Project = relationship("Project", back_populates="Comment")
    Task = relationship("Task", back_populates="Comment")
    User = relationship("User", back_populates="Comment")
    Attachment = relationship("Attachment", back_populates="Comment", cascade="all, delete-orphan")

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class ChatMessage(Base):
    __tablename__ = "ChatMessage"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False)
    UserId = Column(String(36), ForeignKey("User.Id", ondelete="CASCADE"), nullable=False)
    Message = Column(Text, nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)

    # Relationships
    Project = relationship("Project", back_populates="ChatMessage")
    User = relationship("User", back_populates="ChatMessage")

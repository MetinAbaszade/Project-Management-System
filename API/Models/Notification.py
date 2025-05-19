import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from Db.session import Base


class Notification(Base):

    __tablename__ = "Notification"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    UserId = Column(String(36), ForeignKey("User.Id", ondelete="CASCADE"), nullable=False)
    Type = Column(String(50), nullable=False)
    Message = Column(Text, nullable=False)
    RelatedEntityId = Column(String(36))
    RelatedEntityType = Column(String(50))
    IsRead = Column(Boolean, default=False)
    CreatedAt = Column(DateTime, default=datetime.now())

    # Relationships
    User = relationship("User", back_populates="Notifications")


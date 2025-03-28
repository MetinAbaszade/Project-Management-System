import uuid
from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey
from datetime import datetime
from Db.session import Base
from sqlalchemy.orm import relationship

class Notification(Base):
    __tablename__ = "Notifications"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    UserId = Column(String(36), ForeignKey("Users.Id"), nullable=False)
    Title = Column(String(100))
    Content = Column(Text, nullable=False)
    NotificationType = Column(String(50), nullable=False)
    EntityType = Column(String(50))
    EntityId = Column(String(36))
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    IsRead = Column(Boolean, default=False)
    ReadAt = Column(DateTime)
    Link = Column(String(255))
    SourceUserId = Column(String(36), ForeignKey("Users.Id"), nullable=True)

    IsDeleted = Column(Boolean, default=False)

    User = relationship("User", foreign_keys=[UserId])
    SourceUser = relationship("User", foreign_keys=[SourceUserId])

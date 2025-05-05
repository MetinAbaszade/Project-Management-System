import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from Db.session import Base


class Notification(Base):

    __tablename__ = "Notification"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    UserId = Column(String(36), ForeignKey("User.Id", ondelete="CASCADE"), nullable=False)
    Type = Column(String(50), nullable=False)  # task_assigned, comment_added, etc.
    Message = Column(Text, nullable=False)
    RelatedEntityId = Column(String(36))  # ID of task, project, etc.
    RelatedEntityType = Column(String(50))  # Type of related object
    IsRead = Column(Boolean, default=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)

    # Relationships
    User = relationship("User", back_populates="Notifications")

    # @property
    # def TimeElapsed(self):
    #     now = datetime.utcnow()
    #     delta = now - self.CreatedAt
    #
    #     if delta.days > 0:
    #         if delta.days == 1:
    #             return "1 day ago"
    #         else:
    #             return f"{delta.days} days ago"
    #     elif delta.seconds >= 3600:
    #         hours = delta.seconds // 3600
    #         if hours == 1:
    #             return "1 hour ago"
    #         else:
    #             return f"{hours} hours ago"
    #     elif delta.seconds >= 60:
    #         minutes = delta.seconds // 60
    #         if minutes == 1:
    #             return "1 minute ago"
    #         else:
    #             return f"{minutes} minutes ago"
    #     else:
    #         return "Just now"
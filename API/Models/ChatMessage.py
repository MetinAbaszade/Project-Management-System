import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class ChatMessage(Base):

    __tablename__ = "ChatMessage"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False)
    UserId = Column(String(36), ForeignKey("User.Id", ondelete="CASCADE"), nullable=False)
    Content = Column(Text, nullable=False)
    SentAt = Column(DateTime, default=datetime.utcnow)
    IsRead = Column(Boolean, default=False)

    # Relationships
    Project = relationship("Project", back_populates="ChatMessages")
    User = relationship("User")


    #lazim olsa uncomment edin


    # @property
    # def FormattedTime(self):
    #     """Format sent time for display"""
    #     return self.SentAt.strftime("%I:%M %p")
    #
    # @property
    # def TimeElapsed(self):
    #     """Get human-readable elapsed time since message was sent"""
    #     now = datetime.utcnow()
    #     delta = now - self.SentAt
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
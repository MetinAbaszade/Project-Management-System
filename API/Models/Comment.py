import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class Comment(Base):
    """Comments on tasks for discussion"""
    __tablename__ = "Comment"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    TaskId = Column(String(36), ForeignKey("Task.Id", ondelete="CASCADE"), nullable=False)
    UserId = Column(String(36), ForeignKey("User.Id", ondelete="CASCADE"), nullable=False)
    Content = Column(Text, nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, onupdate=datetime.utcnow)

    # Relationships
    Task = relationship("Task", back_populates="Comments")
    User = relationship("User", back_populates="Comments")


    #lazim olsa uncomment edin

    # @property
    # def TimeElapsed(self):
    #     """Get human-readable elapsed time since comment was created"""
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
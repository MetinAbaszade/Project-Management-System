import uuid
from sqlalchemy import Boolean, Column, String, Text, DateTime, ForeignKey
from datetime import datetime
from Db.session import Base
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import relationship

class Comment(Base):
    __tablename__ = "Comments"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    TaskId = Column(String(36), ForeignKey("Tasks.Id"), nullable=False)
    UserId = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    Content = Column(Text, nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    ParentCommentId = Column(String(36), ForeignKey("Comments.Id"), nullable=True)
    IsEdited = Column(Boolean, default=False)
    Mentions = Column(JSON)

    IsDeleted = Column(Boolean, default=False)

    Task = relationship("Task", backref="Comments", foreign_keys=[TaskId])
    User = relationship("User", foreign_keys=[UserId])
    ParentComment = relationship("Comment", remote_side=[Id], backref="Replies")

from sqlalchemy import Column, Integer, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import JSON
from Db.session import Base
from datetime import datetime

class Comment(Base):
    __tablename__ = "comments"

    comment_id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.task_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    parent_comment_id = Column(Integer, ForeignKey("comments.comment_id"), nullable=True)
    is_edited = Column(Boolean, default=False)
    mentions = Column(JSON)

    # Relationships
    task = relationship("Task", backref="comments", foreign_keys=[task_id])
    user = relationship("User", foreign_keys=[user_id])
    parent_comment = relationship("Comment", remote_side=[comment_id], backref="replies")

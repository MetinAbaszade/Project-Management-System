from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base
from datetime import datetime

class TaskAttachment(Base):
    __tablename__ = "task_attachments"

    attachment_id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.task_id"), nullable=False)
    file_url = Column(String(255), nullable=False)
    file_name = Column(String(100), nullable=False)
    file_size = Column(Integer)
    file_type = Column(String(50))
    uploaded_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    description = Column(Text)

    # Relationships
    task = relationship("Task", backref="attachments", foreign_keys=[task_id])
    uploader = relationship("User", foreign_keys=[uploaded_by])

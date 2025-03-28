import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from datetime import datetime
from Db.session import Base
from sqlalchemy.orm import relationship

class TaskAttachment(Base):
    __tablename__ = "TaskAttachments"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    TaskId = Column(String(36), ForeignKey("Tasks.Id"), nullable=False)
    FileUrl = Column(String(255), nullable=False)
    FileName = Column(String(100), nullable=False)
    FileSize = Column(Integer)
    FileType = Column(String(50))
    UploadedBy = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    UploadedAt = Column(DateTime, default=datetime.utcnow)
    Description = Column(Text)
    Task = relationship("Task", backref="Attachments", foreign_keys=[TaskId])
    Uploader = relationship("User", foreign_keys=[UploadedBy])

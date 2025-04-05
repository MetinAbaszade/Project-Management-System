import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class Attachment(Base):
    __tablename__ = "Attachment"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=True)
    TaskId = Column(String(36), ForeignKey("Task.Id", ondelete="CASCADE"), nullable=True)
    CommentId = Column(String(36), ForeignKey("Comment.Id", ondelete="CASCADE"), nullable=True)
    FilePath = Column(String(255), nullable=False)
    FileType = Column(String(50))
    UploadedAt = Column(DateTime, default=datetime.utcnow)

    # Relationships
    Project = relationship("Project", back_populates="Attachment")
    Task = relationship("Task", back_populates="Attachment")
    Comment = relationship("Comment", back_populates="Attachment")

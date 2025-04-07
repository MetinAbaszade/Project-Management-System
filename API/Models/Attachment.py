import uuid
from datetime import datetime
import os
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class Attachment(Base):

    __tablename__ = "Attachment"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    TaskId = Column(String(36), ForeignKey("Task.Id", ondelete="CASCADE"), nullable=False)
    FileName = Column(String(255), nullable=False)
    FileType = Column(String(50))
    FileSize = Column(Integer)
    FilePath = Column(String(500), nullable=False)
    UploadedById = Column(String(36), ForeignKey("User.Id"), nullable=False)
    UploadedAt = Column(DateTime, default=datetime.utcnow)

    # Relationships
    Task = relationship("Task", back_populates="Attachments")
    UploadedBy = relationship("User", back_populates="Attachments")



    # bunlari ayri filede implement edeceksinizse silin



   # @property
   #  def FileExtension(self):
   #
   #      _, extension = os.path.splitext(self.FileName)
   #      return extension.lower()
   #
   #  @property
   #  def HumanReadableSize(self):
   #      """Convert bytes to human-readable file size"""
   #      if not self.FileSize:
   #          return "0 B"
   #
   #      size = self.FileSize
   #      for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
   #          if size < 1024 or unit == 'TB':
   #              return f"{size:.1f} {unit}" if size % 1 else f"{size:.0f} {unit}"
   #          size /= 1024
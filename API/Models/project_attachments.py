import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from datetime import datetime
from Db.session import Base
from sqlalchemy.orm import relationship

class ProjectAttachment(Base):
    __tablename__ = "ProjectAttachments"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Projects.Id"), nullable=False)
    FileUrl = Column(String(255), nullable=False)
    FileName = Column(String(100), nullable=False)
    FileSize = Column(Integer)
    FileType = Column(String(50))
    UploadedBy = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    UploadedAt = Column(DateTime, default=datetime.utcnow)
    Description = Column(Text)


    Project = relationship("Project", backref="ProjectAttachments", foreign_keys=[ProjectId])
    Uploader = relationship("User", foreign_keys=[UploadedBy])

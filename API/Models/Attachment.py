import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Boolean, Enum as SqlEnum
from sqlalchemy.orm import relationship
from Db.session import Base
import enum


class AttachmentEntityType(str, enum.Enum):
    SCOPE = "Scope"
    RISK = "Risk"
    RESOURCE = "Resource"
    SCHEDULE = "Schedule"
    COST = "Cost"

class Attachment(Base):
    __tablename__ = "Attachment"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id"), nullable=False)
    EntityType = Column(SqlEnum(AttachmentEntityType), nullable=False)
    EntityId = Column(String(36), nullable=False)
    FileName = Column(String(255), nullable=False)
    FileType = Column(String(50))
    FileSize = Column(Integer)
    FilePath = Column(String(500), nullable=False)
    OwnerId = Column(String(36), ForeignKey("User.Id"), nullable=False)
    IsDeleted = Column(Boolean, default=False)
    UploadedAt = Column(DateTime, default=datetime.utcnow)


    Project = relationship("Project", back_populates="Attachments")
    Owner = relationship("User", back_populates="Attachments")

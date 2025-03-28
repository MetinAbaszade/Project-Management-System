import uuid
from sqlalchemy import Column, String, Text, DateTime, Boolean, Enum, ForeignKey
from datetime import datetime
from Db.session import Base
import enum
from sqlalchemy.orm import relationship

class SeverityEnum(enum.Enum):
    Info = "Info"
    Warning = "Warning"
    Critical = "Critical"

class SystemNotification(Base):
    __tablename__ = "SystemNotifications"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Title = Column(String(100), nullable=False)
    Content = Column(Text, nullable=False)
    Severity = Column(Enum(SeverityEnum), default=SeverityEnum.Info)
    StartDate = Column(DateTime, nullable=False)
    EndDate = Column(DateTime)
    IsDismissible = Column(Boolean, default=True)
    TargetRoles = Column(String(255))
    TargetUsers = Column(String(255))
    CreatedBy = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    Creator = relationship("User", foreign_keys=[CreatedBy])

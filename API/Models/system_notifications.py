from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base
import enum
from datetime import datetime

class Severity(enum.Enum):
    Info = "Info"
    Warning = "Warning"
    Critical = "Critical"

class SystemNotification(Base):
    __tablename__ = "system_notifications"

    notification_id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    severity = Column(Enum(Severity), default=Severity.Info)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)
    is_dismissible = Column(Boolean, default=True)
    target_roles = Column(String(255))
    target_users = Column(String(255))
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by])

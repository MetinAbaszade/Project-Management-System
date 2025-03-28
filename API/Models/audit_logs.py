import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from datetime import datetime
from Db.session import Base
from sqlalchemy.orm import relationship

class AuditLog(Base):
    __tablename__ = "AuditLogs"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    UserId = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    ActionType = Column(String(50), nullable=False)
    EntityType = Column(String(50), nullable=False)
    EntityId = Column(String(36))
    ActionTime = Column(DateTime, default=datetime.utcnow)
    IpAddress = Column(String(45))
    UserAgent = Column(Text)
    RequestMethod = Column(String(10))
    RequestPath = Column(String(255))
    ChangesMade = Column(Text)
    StatusCode = Column(Integer)

    User = relationship("User", foreign_keys=[UserId])

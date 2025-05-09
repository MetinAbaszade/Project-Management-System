import uuid
from sqlalchemy import Boolean, Column, String, Integer, DateTime, ForeignKey, Text

from datetime import datetime
from Db.session import Base
from sqlalchemy.orm import relationship




 # frontendde projectsde ve user profilede activity section var

 # bezi columnnlari sile bilersiz

class AuditLog(Base):
    __tablename__ = "AuditLog"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    UserId = Column(String(36), ForeignKey("User.Id"), nullable=True)
    ActionType = Column(String(50), nullable=False)
    EntityType = Column(String(50), nullable=False)
    EntityId = Column(String(36))
    ActionTime = Column(DateTime, default=datetime.now())
    IpAddress = Column(String(45))
    UserAgent = Column(Text)
    RequestMethod = Column(String(10))
    RequestPath = Column(String(255))
    ChangesMade = Column(Text)
    StatusCode = Column(Integer)

    IsDeleted = Column(Boolean, default=False)

    User = relationship("User", foreign_keys=[UserId])
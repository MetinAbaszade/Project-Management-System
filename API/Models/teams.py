import uuid
from sqlalchemy import Boolean, Column, String, Text, DateTime, ForeignKey
from datetime import datetime
from Db.session import Base
from sqlalchemy.orm import relationship

class Team(Base):
    __tablename__ = "Teams"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Name = Column(String(100), nullable=False)
    Description = Column(Text)
    LeadUserId = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    lead = relationship("User", foreign_keys=[LeadUserId])
    
    IsDeleted = Column(Boolean, default=False)

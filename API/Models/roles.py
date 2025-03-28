import uuid
from sqlalchemy import Column, String, Boolean, DateTime
from datetime import datetime
from Db.session import Base

class Role(Base):
    __tablename__ = "Roles"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    RoleName = Column(String(50), nullable=False, unique=True)
    IsAdmin = Column(Boolean, default=False)
    Description = Column(String(255))
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    
    IsDeleted = Column(Boolean, default=False)

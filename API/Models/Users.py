import uuid
from sqlalchemy import Column, String, DateTime, Boolean, Integer
from datetime import datetime
from Db.session import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "Users"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    FirstName = Column(String(50), nullable=False)
    LastName = Column(String(50), nullable=False)
    Email = Column(String(100), nullable=False, unique=True)
    Password = Column(String(255), nullable=False)
    ImageUrl = Column(String(255))
    IsActive = Column(Boolean, default=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    LastLogin = Column(DateTime)
    ResetToken = Column(String(255))
    ResetTokenExpires = Column(DateTime)
    LoginAttempts = Column(Integer, default=0)
    LastPasswordChange = Column(DateTime)
    RequirePasswordChange = Column(Boolean, default=False)
    
    #gpt projects.py da define ele demisdi 
    #error cixa biler 
User.ProjectsOwned = relationship("Project", back_populates="owner")
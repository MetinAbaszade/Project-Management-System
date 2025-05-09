import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from Db.session import Base

class ResourcePlan(Base):
    __tablename__ = "ResourcePlan"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id"), nullable=False)
    OwnerId = Column(String(36), ForeignKey("User.Id"), nullable=False)
    Notes = Column(Text)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    IsDeleted = Column(Boolean, default=False)

    # Relationships
    Project = relationship("Project", back_populates="ResourcePlans")
    Owner = relationship("User")

    # project.py
    #ResourcePlans = relationship("ResourcePlan", back_populates="Project", cascade="all, delete-orphan")


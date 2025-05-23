import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from Db.session import Base

class Resource(Base):
    __tablename__ = "Resource"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id"), nullable=False)
    Name = Column(String(50), nullable=False)
    Type = Column(String(50), nullable=False)
    Total = Column(Float, nullable=True)
    Available = Column(Float, nullable=True)
    Description = Column(Text)
    Unit = Column(String(36))
    IsDeleted = Column(Boolean, default=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)

    # Relationships
    ActivityAssignments = relationship("ActivityResource", back_populates="Resource", cascade="all, delete-orphan")
    Project = relationship("Project", back_populates="Resources")


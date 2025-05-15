import uuid
from datetime import datetime
from sqlalchemy import Column, String, Numeric, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from Db.session import Base

class ActivityResource(Base):
    __tablename__ = "ActivityResource"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    TaskId = Column(String(36), ForeignKey("Task.Id"), nullable=False)
    ResourceId = Column(String(36), ForeignKey("Resource.Id"), nullable=False)
    Quantity = Column(Numeric(12, 2), nullable=False) 
    EstimatedCost = Column(Numeric(12, 2), nullable=False)  
    IsDeleted = Column(Boolean, default=False)
    AssignedAt = Column(DateTime, default=datetime.utcnow)

    # Relationships
    Task = relationship("Task", back_populates="AssignedResources")
    Resource = relationship("Resource", back_populates="ActivityAssignments")

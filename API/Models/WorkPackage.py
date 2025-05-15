# Models/WorkPackage.py

from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import uuid
from Db.session import Base

class WorkPackage(Base):
    __tablename__ = "WorkPackage"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Name = Column(String(255), nullable=False)
    Description = Column(String(500))
    EstimatedDuration = Column(Integer)
    IsDeleted = Column(Boolean, default=False)
    
    WBSId = Column(String(36), ForeignKey("WorkBreakdownStructure.Id"), nullable=False)

    # Relationship back to WBS
    WBS = relationship("WorkBreakdownStructure", back_populates="WorkPackages")

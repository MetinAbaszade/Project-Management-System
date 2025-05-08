import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Integer, Numeric
from sqlalchemy.orm import relationship
from Db.session import Base

class WorkBreakdownStructure(Base):
    __tablename__ = "WorkBreakdownStructure"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    # ProjectScopeId = Column(String(36), ForeignKey("ProjectScope.Id"), nullable=False)

    WorkPackageName = Column(String(255))
    WorkDescription = Column(Text)
    EstimatedDuration = Column(Integer)  # in days/hours
    EstimatedCost = Column(Numeric(10, 2))

    ProjectScope = relationship("ProjectScope", back_populates="WBS")

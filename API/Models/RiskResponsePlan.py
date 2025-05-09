import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from Db.session import Base

class RiskResponsePlan(Base):
    __tablename__ = "RiskResponsePlans"

    Id = Column(String(36), primary_key=True, default = lambda: str(uuid.uuid4()))
    RiskId = Column(String(36), ForeignKey("Risks.Id"), nullable=False)
    Strategy = Column(String(256))
    Description = Column(Text)
    OwnerId = Column(String(36), ForeignKey("User.Id"), nullable=False)
    PlannedActions = Column(Text, nullable=False)
    Status = Column(String(50), default="Planned")
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    IsDeleted = Column(Boolean, default=False)

    Risk = relationship("Risk", back_populates="ResponsePlans")
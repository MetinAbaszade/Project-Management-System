import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Integer, Numeric
from sqlalchemy.orm import relationship
from Db.session import Base

class ScopeManagementPlan(Base):
    __tablename__ = "ScopeManagementPlan"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    # ProjectScopeId = Column(String(36), ForeignKey("ProjectScope.Id"), nullable=False)

    ScopePreparation = Column(Text)
    WBSDevelopmentApproach = Column(Text)
    ScopeBaselineApproval = Column(Text)
    DeliverableImpact = Column(Text)

    ReqPlanningApproach = Column(Text)
    ReqChangeControl = Column(Text)
    ReqPrioritization = Column(Text)
    ReqMetrics = Column(Text)

    ProjectScope = relationship("ProjectScope", back_populates="ScopeManagementPlan")

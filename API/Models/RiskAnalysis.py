import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from Db.session import Base

class RiskAnalysis(Base):
    __tablename__ = "RiskAnalyses"

    Id = Column(String(36), primary_key=True, default = lambda: str(uuid.uuid4()))
    RiskId = Column(String(36), ForeignKey("Risks.Id"), nullable=False)
    AnalysisType = Column(String(50), nullable=False)  
    MatrixScore = Column(String(50), nullable=False)
    ExpectedValue = Column(Float, nullable=False)
    AnalysisDate = Column(DateTime, default=datetime.utcnow)
    OwnerId = Column(String(36), ForeignKey("User.Id"), nullable=False)
    IsDeleted = Column(Boolean, default=False)


    Risk = relationship("Risk", back_populates="Analyses")
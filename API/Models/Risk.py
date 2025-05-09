import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Float, DateTime, Boolean, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from Db.session import Base

class Risk(Base):
    __tablename__ = "Risks"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id"), nullable=False)
    Name = Column(String(256), nullable=False)
    Description = Column(Text)
    Category = Column(String(50), nullable=False)

    Probability = Column(Float, nullable=False)
    Impact = Column(Integer)
    Severity = Column(Float, nullable=False)

    OwnerId = Column(String(36), ForeignKey("User.Id"), nullable=False)
    IdentifiedDate = Column(DateTime, default=datetime.utcnow)
    Status = Column(String(50), default="Open")
    IsDeleted = Column(Boolean, default=False)

    Analyses = relationship("RiskAnalysis", back_populates="Risk", cascade="all, delete-orphan")
    ResponsePlans = relationship("RiskResponsePlan", back_populates="Risk", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("Probability >= 0.0 AND Probability <= 1.0", name="check_probability_range"),
        CheckConstraint("Impact >= 1 AND Impact <= 10", name="check_impact_range"),
    )

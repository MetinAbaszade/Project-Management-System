import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Integer, Numeric
from sqlalchemy.orm import relationship
from Db.session import Base

class RequirementDocument(Base):
    __tablename__ = "RequirementDocument"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    #ProjectScopeId = Column(String(36), ForeignKey("ProjectScope.Id"), nullable=False)

    StakeholderNeeds = Column(Text)
    RequirementTraceability = Column(Text)
    RequirementAcceptanceCriteria = Column(Text)

    ProjectScope = relationship("ProjectScope", back_populates="RequirementDocument")
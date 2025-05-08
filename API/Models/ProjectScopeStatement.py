import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Integer, Numeric
from sqlalchemy.orm import relationship
from Db.session import Base

class ProjectScopeStatement(Base):
    __tablename__ = "ProjectScopeStatement"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    # ProjectScopeId = Column(String(36), ForeignKey("ProjectScope.Id"), nullable=False)

    ScopeDescription = Column(Text)
    Deliverables = Column(Text)
    AcceptanceCriteria = Column(Text)
    Exclusions = Column(Text)
    Assumptions = Column(Text)
    Constraints = Column(Text)

    IncludesSOW = Column(Boolean, default=False)
    StatementOfWork = Column(Text)

    ProjectScope = relationship("ProjectScope", back_populates="ScopeStatement")

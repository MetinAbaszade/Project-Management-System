import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Integer, Numeric
from sqlalchemy.orm import relationship
from Db.session import Base

class ProjectScopeStatement(Base):
    __tablename__ = "ProjectScopeStatement"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    ScopeDescription = Column(Text)
    Deliverables = Column(Text)
    AcceptanceCriteria = Column(Text)
    Exclusions = Column(Text)
    Assumptions = Column(Text)
    Constraints = Column(Text)

    IsDeleted = Column(Boolean, default=False)


    IncludesSOW = Column(Boolean, default=False)
    StatementOfWork = Column(Text)

    ProjectScope = relationship("ProjectScope", back_populates="ScopeStatement")

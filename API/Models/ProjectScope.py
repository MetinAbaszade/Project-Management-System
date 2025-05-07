import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from Db.session import Base

class ProjectScope(Base):
    __tablename__ = "ProjectScope"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id"), nullable=False)

    # These fields store structured data as serialized JSON strings
    ScopeManagementPlan = Column(Text, nullable=True)
    RequirementManagementPlan = Column(Text, nullable=True)
    RequirementDocumentation = Column(Text, nullable=True)
    ProjectScopeStatement = Column(Text, nullable=True)
    WorkBreakdownStructure = Column(Text, nullable=True)

    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, onupdate=datetime.utcnow)

    # Relationship to Project
    Project = relationship("Project", back_populates="Scope")

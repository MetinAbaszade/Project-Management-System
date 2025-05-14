import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base

class ProjectScope(Base):
    __tablename__ = "ProjectScope"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id"), nullable=False)

    ScopeManagementPlanId = Column(String(36), ForeignKey("ScopeManagementPlan.Id"), nullable=False, unique = True)
    RequirementDocumentId = Column(String(36), ForeignKey("RequirementDocument.Id"), nullable=False, unique = True)
    ScopeStatementId = Column(String(36), ForeignKey("ProjectScopeStatement.Id"), nullable=False, unique = True)
    WBSId = Column(String(36), ForeignKey("WorkBreakdownStructure.Id"), nullable=False, unique = True)

    CreatedAt = Column(DateTime, default=datetime.now())
    UpdatedAt = Column(DateTime, onupdate=datetime.now())

    # Relationships
    Project = relationship("Project", back_populates="Scope")
    ScopeManagementPlan = relationship(
        "ScopeManagementPlan",
        back_populates="ProjectScope",
        uselist=False
    )

    RequirementDocument = relationship(
        "RequirementDocument",
        back_populates="ProjectScope",
        uselist=False
    )

    ScopeStatement = relationship(
        "ProjectScopeStatement",
        back_populates="ProjectScope",
        uselist=False
    )

    WBS = relationship(
        "WorkBreakdownStructure",
        back_populates="ProjectScope",
        uselist=False
    )


from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


# 1. Scope Management Plan
class ScopeManagementPlanSchema(BaseModel):
    ScopeDefinitionMethod: Optional[str] = None
    WBSDevelopmentMethod: Optional[str] = None
    ScopeBaselineApproval: Optional[str] = None
    DeliverablesImpactHandling: Optional[str] = None


class RequirementManagementPlanSchema(BaseModel):
    ReqPlanningApproach: Optional[str] = None
    ReqChangeControl: Optional[str] = None
    ReqPrioritization: Optional[str] = None
    ReqMetrics: Optional[str] = None


# 2. Requirement Documentation
class RequirementDocumentSchema(BaseModel):
    StakeholderNeeds: Optional[List[str]] = None
    QuantifiedExpectations: Optional[List[str]] = None
    Traceability: Optional[str] = None


# 3. Scope Statement
class ProjectScopeStatementSchema(BaseModel):
    EndProductScope: Optional[str] = None
    Deliverables: Optional[List[str]] = None
    AcceptanceCriteria: Optional[str] = None
    Exclusions: Optional[str] = None
    OptionalSOW: Optional[str] = None


# 4. Work Breakdown Structure
class WorkPackageSchema(BaseModel):
    Name: str
    Description: Optional[str] = None
    EstimatedDuration: Optional[int] = None

    class Config:
        orm_mode = True


class WorkBreakdownStructureSchema(BaseModel):
    WorkPackages: Optional[List[WorkPackageSchema]] = None
    ScopeBaselineReference: Optional[str] = None

    class Config:
        orm_mode = True


# -------------
# Update

# 1. Scope Management Plan (Update)
class ScopeManagementPlanUpdateSchema(BaseModel):
    ScopeDefinitionMethod: Optional[str] = None
    WBSDevelopmentMethod: Optional[str] = None
    ScopeBaselineApproval: Optional[str] = None
    DeliverablesImpactHandling: Optional[str] = None


class RequirementManagementPlanUpdateSchema(BaseModel):
    ReqPlanningApproach: Optional[str] = None
    ReqChangeControl: Optional[str] = None
    ReqPrioritization: Optional[str] = None
    ReqMetrics: Optional[str] = None


# 2. Requirement Document (Update)
class RequirementDocumentUpdateSchema(BaseModel):
    StakeholderNeeds: Optional[List[str]] = None
    QuantifiedExpectations: Optional[List[str]] = None
    Traceability: Optional[str] = None


# 3. Project Scope Statement (Update)
class ProjectScopeStatementUpdateSchema(BaseModel):
    EndProductScope: Optional[str] = None
    Deliverables: Optional[List[str]] = None
    AcceptanceCriteria: Optional[str] = None
    Exclusions: Optional[str] = None
    OptionalSOW: Optional[str] = None


# 4. Work Breakdown Structure (Update)
class WorkPackageUpdateSchema(BaseModel):
    Name: Optional[str] = None
    Description: Optional[str] = None
    EstimatedDuration: Optional[float] = None


class WorkBreakdownStructureUpdateSchema(BaseModel):
    WorkPackages: Optional[List[WorkPackageUpdateSchema]] = None
    ScopeBaselineReference: Optional[str] = None

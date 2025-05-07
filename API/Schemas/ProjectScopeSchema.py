from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


# 1. Scope Management Plan
class ScopeManagementPlanSchema(BaseModel):
    ScopeDefinitionMethod: str
    WBSDevelopmentMethod: str
    ScopeBaselineApproval: str
    DeliverablesImpactHandling: str


class RequirementManagementPlanSchema(BaseModel):
    ReqPlanningApproach: str
    ReqChangeControl: str
    ReqPrioritization: str
    ReqMetrics: str


# 2. Requirement Documentation
class RequirementDocumentSchema(BaseModel):
    StakeholderNeeds: List[str]
    QuantifiedExpectations: List[str]
    Traceability: str


# 3. Scope Statement
class ProjectScopeStatementSchema(BaseModel):
    EndProductScope: str
    Deliverables: List[str]
    AcceptanceCriteria: str
    Exclusions: str
    OptionalSOW: Optional[str] = None


# 4. Work Breakdown Structure
class WorkPackageSchema(BaseModel):
    Name: str
    Description: str
    EstimatedDuration: Optional[float]
    EstimatedCost: Optional[float]


class WorkBreakdownStructureSchema(BaseModel):
    WorkPackages: List[WorkPackageSchema]
    ScopeBaselineReference: Optional[str]

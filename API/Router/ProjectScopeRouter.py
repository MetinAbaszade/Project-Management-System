from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from Dependencies.db import GetDb
from Schemas.ProjectScopeSchema import (
    ScopeManagementPlanSchema,
    RequirementManagementPlanSchema,
    RequirementDocumentSchema,
    ProjectScopeStatementSchema,
    WorkBreakdownStructureSchema
)
from Repositories.ProjectScopeRepository import ProjectScopeRepository
from Services.ProjectScopeService import ProjectScopeService

router = APIRouter(
    prefix="/scope",
    tags=["Project Scope"]
)


@router.post("/add/{projectId}")
def AddProjectScope(
    projectId: str,
    scopeManagementPlan: ScopeManagementPlanSchema,
    requirementManagementPlan: RequirementManagementPlanSchema,
    requirementDocumentation: RequirementDocumentSchema,
    projectScopeStatement: ProjectScopeStatementSchema,
    workBreakdownStructure: WorkBreakdownStructureSchema,
    db: Session = Depends(GetDb)
):
    repository = ProjectScopeRepository(db)  # ✅ FIX: Instantiate repository with DB session
    service = ProjectScopeService(repository)  # ✅ FIX: Inject repository into service
    return service.AddScope(
        projectId,
        scopeManagementPlan,
        requirementManagementPlan,
        requirementDocumentation,
        projectScopeStatement,
        workBreakdownStructure
    )


@router.put("/edit/{projectId}")
def EditProjectScope(
    projectId: str,
    scopeManagementPlan: ScopeManagementPlanSchema,
    requirementManagementPlan: RequirementManagementPlanSchema,
    requirementDocumentation: RequirementDocumentSchema,
    projectScopeStatement: ProjectScopeStatementSchema,
    workBreakdownStructure: WorkBreakdownStructureSchema,
    db: Session = Depends(GetDb)
):
    repository = ProjectScopeRepository(db)
    service = ProjectScopeService(repository)
    return service.EditScope(
        projectId,
        scopeManagementPlan,
        requirementManagementPlan,
        requirementDocumentation,
        projectScopeStatement,
        workBreakdownStructure
    )


from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from Dependencies.db import GetDb
from Schemas.ProjectScopeSchema import (
    ScopeManagementPlanSchema,
    RequirementManagementPlanSchema,
    RequirementDocumentSchema,
    ProjectScopeStatementSchema,
    WorkBreakdownStructureSchema,

    ScopeManagementPlanUpdateSchema,
    RequirementManagementPlanUpdateSchema,
    RequirementDocumentUpdateSchema,
    ProjectScopeStatementUpdateSchema,
    WorkBreakdownStructureUpdateSchema
)
from Repositories.ProjectScopeRepository import ProjectScopeRepository
from Services.ProjectScopeService import ProjectScopeService

router = APIRouter(
    prefix="/scope",
    tags=["Project Scope"]
)


from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from Dependencies.db import GetDb
from Services.ProjectScopeService import ProjectScopeService
from Schemas.ProjectScopeSchema import (
    ScopeManagementPlanSchema,
    RequirementManagementPlanSchema,
    RequirementDocumentSchema,
    ProjectScopeStatementSchema,
    WorkBreakdownStructureSchema
)

router = APIRouter(prefix="/scope", tags=["Project Scope"])

@router.post("/add/scope-management/{projectId}")
def AddScopeManagementPlan(projectId: str, data: ScopeManagementPlanSchema, db: Session = Depends(GetDb)):
    return ProjectScopeService(db).AddScopeManagementPlan(projectId, data)

@router.post("/add/requirement-management/{projectId}")
def AddRequirementManagementPlan(projectId: str, data: RequirementManagementPlanSchema, db: Session = Depends(GetDb)):
    return ProjectScopeService(db).AddRequirementManagementPlan(projectId, data)

@router.post("/add/requirement-document/{projectId}")
def AddRequirementDocument(projectId: str, data: RequirementDocumentSchema, db: Session = Depends(GetDb)):
    return ProjectScopeService(db).AddRequirementDocument(projectId, data)

@router.post("/add/scope-statement/{projectId}")
def AddScopeStatement(projectId: str, data: ProjectScopeStatementSchema, db: Session = Depends(GetDb)):
    return ProjectScopeService(db).AddScopeStatement(projectId, data)

@router.post("/add/wbs/{projectId}")
def AddWorkBreakdownStructure(projectId: str, data: WorkBreakdownStructureSchema, db: Session = Depends(GetDb)):
    return ProjectScopeService(db).AddWorkBreakdownStructure(projectId, data)

@router.put("/edit/scope-management/{projectId}")
def EditScopeManagementPlan(projectId: str, data: ScopeManagementPlanUpdateSchema, db: Session = Depends(GetDb)):
    return ProjectScopeService(db).EditScopeManagementPlan(projectId, data)

@router.put("/edit/requirement-management/{projectId}")
def EditRequirementManagementPlan(projectId: str, data: RequirementManagementPlanUpdateSchema, db: Session = Depends(GetDb)):
    return ProjectScopeService(db).EditRequirementManagementPlan(projectId, data)

@router.put("/edit/requirement-document/{projectId}")
def EditRequirementDocument(projectId: str, data: RequirementDocumentUpdateSchema, db: Session = Depends(GetDb)):
    return ProjectScopeService(db).EditRequirementDocument(projectId, data)

@router.put("/edit/scope-statement/{projectId}")
def EditScopeStatement(projectId: str, data: ProjectScopeStatementUpdateSchema, db: Session = Depends(GetDb)):
    return ProjectScopeService(db).EditScopeStatement(projectId, data)

@router.put("/edit/wbs/{projectId}")
def EditWorkBreakdownStructure(projectId: str, data: WorkBreakdownStructureUpdateSchema, db: Session = Depends(GetDb)):
    return ProjectScopeService(db).EditWorkBreakdownStructure(projectId, data)

@router.get("/plan/{projectId}", response_model=ScopeManagementPlanSchema)
def GetScopeManagementPlan(projectId: str, service: ProjectScopeService = Depends()):
    return service.GetScopeManagementPlan(projectId)

@router.get("/requirements/plan/{projectId}", response_model=RequirementManagementPlanSchema)
def GetRequirementManagementPlan(projectId: str, service: ProjectScopeService = Depends()):
    return service.GetRequirementManagementPlan(projectId)

@router.get("/requirements/doc/{projectId}", response_model=RequirementDocumentSchema)
def GetRequirementDocument(projectId: str, service: ProjectScopeService = Depends()):
    return service.GetRequirementDocument(projectId)

@router.get("/statement/{projectId}", response_model=ProjectScopeStatementSchema)
def GetScopeStatement(projectId: str, service: ProjectScopeService = Depends()):
    return service.GetScopeStatement(projectId)

@router.get("/wbs/{projectId}", response_model=WorkBreakdownStructureSchema)
def GetWorkBreakdownStructure(projectId: str, service: ProjectScopeService = Depends()):
    return service.GetWorkBreakdownStructure(projectId)
from fastapi import Depends, status, HTTPException
from Repositories.ProjectScopeRepository import ProjectScopeRepository
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
from Models.ProjectScope import ProjectScope

class ProjectScopeService:

    def __init__(self, projectScopeRepository: ProjectScopeRepository = Depends()):
        self.projectScopeRepository = projectScopeRepository

    def AddScope(self, projectId: str,
                 scopeManagementPlan: ScopeManagementPlanSchema,
                 requirementManagementPlan: RequirementManagementPlanSchema,
                 requirementDocumentation: RequirementDocumentSchema,
                 projectScopeStatement: ProjectScopeStatementSchema,
                 workBreakdownStructure: WorkBreakdownStructureSchema,
                 ):
        # existingScope = self.db.query(ProjectScope).filter_by(ProjectId=projectId).first()
        # if existingScope:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="Scope already exists for this project."
        #     )
        return self.projectScopeRepository.CreateScope(
            projectId,
            scopeManagementPlan,
            requirementManagementPlan,
            requirementDocumentation,
            projectScopeStatement,
            workBreakdownStructure
        )

    def EditScope(self, projectId: str,
                  scopeManagementPlan: ScopeManagementPlanUpdateSchema,
                  requirementManagementPlan: RequirementManagementPlanUpdateSchema,
                  requirementDocumentation: RequirementDocumentUpdateSchema,
                  projectScopeStatement: ProjectScopeStatementUpdateSchema,
                  workBreakdownStructure: WorkBreakdownStructureUpdateSchema):
        
        existingScope = self.db.query(ProjectScope).filter_by(ProjectId=projectId).first()
        if not existingScope:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Scope does not exist for this project"
            )
        
        return self.projectScopeRepository.UpdateScope(
            projectId,
            scopeManagementPlan,
            requirementManagementPlan,
            requirementDocumentation,
            projectScopeStatement,
            workBreakdownStructure
        )

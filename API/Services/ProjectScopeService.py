from fastapi import Depends
from Repositories.ProjectScopeRepository import ProjectScopeRepository
from Schemas.ProjectScopeSchema import (
    ScopeManagementPlanSchema,
    RequirementManagementPlanSchema,
    RequirementDocumentSchema,
    ProjectScopeStatementSchema,
    WorkBreakdownStructureSchema
)

class ProjectScopeService:

    def __init__(self, projectScopeRepository: ProjectScopeRepository = Depends()):
        self.projectScopeRepository = projectScopeRepository

    def AddScope(self, projectId: str,
                 scopeManagementPlan: ScopeManagementPlanSchema,
                 requirementManagementPlan: RequirementManagementPlanSchema,
                 requirementDocumentation: RequirementDocumentSchema,
                 projectScopeStatement: ProjectScopeStatementSchema,
                 workBreakdownStructure: WorkBreakdownStructureSchema):
        return self.projectScopeRepository.CreateScope(
            projectId,
            scopeManagementPlan,
            requirementManagementPlan,
            requirementDocumentation,
            projectScopeStatement,
            workBreakdownStructure
        )

    def EditScope(self, projectId: str,
                  scopeManagementPlan: ScopeManagementPlanSchema,
                  requirementManagementPlan: RequirementManagementPlanSchema,
                  requirementDocumentation: RequirementDocumentSchema,
                  projectScopeStatement: ProjectScopeStatementSchema,
                  workBreakdownStructure: WorkBreakdownStructureSchema):
        return self.projectScopeRepository.UpdateScope(
            projectId,
            scopeManagementPlan,
            requirementManagementPlan,
            requirementDocumentation,
            projectScopeStatement,
            workBreakdownStructure
        )

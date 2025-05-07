from sqlalchemy.orm import Session
from Models.ProjectScope import ProjectScope
from Schemas.ProjectScopeSchema import (
    ScopeManagementPlanSchema,
    RequirementManagementPlanSchema,
    RequirementDocumentSchema,
    ProjectScopeStatementSchema,
    WorkBreakdownStructureSchema
)
from fastapi import HTTPException, status


class ProjectScopeRepository:

    def __init__(self, db: Session):
        self.db = db

    def CreateScope(self, projectId: str,
                    scopeManagementPlan: ScopeManagementPlanSchema,
                    requirementManagementPlan: RequirementManagementPlanSchema,
                    requirementDocumentation: RequirementDocumentSchema,
                    projectScopeStatement: ProjectScopeStatementSchema,
                    workBreakdownStructure: WorkBreakdownStructureSchema):

        existingScope = self.db.query(ProjectScope).filter_by(ProjectId=projectId).first()
        if existingScope:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Scope already exists for this project."
            )

        # Step 1: Create ProjectScope
        newScope = ProjectScope(ProjectId=projectId)
        self.db.add(newScope)
        self.db.commit()
        self.db.refresh(newScope)

        # Step 2: Add related entities (linked by ProjectScopeId)
        scopePlan = ScopeManagementPlanSchema(
            ProjectScopeId=newScope.Id,
            ScopePreparation=scopeManagementPlan.ScopeDefinitionMethod,
            WBSDevelopmentApproach=scopeManagementPlan.WBSDevelopmentMethod,
            ScopeBaselineApproval=scopeManagementPlan.ScopeBaselineApproval,
            DeliverableImpact=scopeManagementPlan.DeliverablesImpactHandling,
            ReqPlanningApproach=requirementManagementPlan.RequirementPlanning,
            ReqChangeControl=requirementManagementPlan.ChangeManagement,
            ReqPrioritization=requirementManagementPlan.PrioritizationMethod,
            ReqMetrics=requirementManagementPlan.MetricsUsed
        )

        requirementDoc = RequirementManagementPlanSchema(
            ProjectScopeId=newScope.Id,
            StakeholderNeeds="\n".join(requirementDocumentation.StakeholderNeeds),
            RequirementTraceability=requirementDocumentation.Traceability,
            RequirementAcceptanceCriteria="\n".join(requirementDocumentation.QuantifiedExpectations)
        )

        scopeStatement = ProjectScopeStatementSchema(
            ProjectScopeId=newScope.Id,
            ScopeDescription=projectScopeStatement.EndProductScope,
            Deliverables="\n".join(projectScopeStatement.Deliverables),
            AcceptanceCriteria=projectScopeStatement.AcceptanceCriteria,
            Exclusions=projectScopeStatement.Exclusions,
            StatementOfWork=projectScopeStatement.OptionalSOW,
            IncludesSOW=bool(projectScopeStatement.OptionalSOW)
        )

        # Add multiple work packages
        for wp in workBreakdownStructure.WorkPackages:
            wbs = WorkBreakdownStructureSchema(
                ProjectScopeId=newScope.Id,
                WorkPackageName=wp.Name,
                WorkDescription=wp.Description,
                EstimatedDuration=wp.EstimatedDuration,
                EstimatedCost=wp.EstimatedCost
            )
            self.db.add(wbs)

        # Step 3: Add all subcomponents
        self.db.add(scopePlan)
        self.db.add(requirementDoc)
        self.db.add(scopeStatement)

        self.db.commit()
        self.db.refresh(newScope)

        return newScope


    def UpdateScope(self, projectId: str,
                    scopeManagementPlan: ScopeManagementPlanSchema,
                    requirementManagementPlan: RequirementManagementPlanSchema,
                    requirementDocumentation: RequirementDocumentSchema,
                    projectScopeStatement: ProjectScopeStatementSchema,
                    workBreakdownStructure: WorkBreakdownStructureSchema):
        scope = self.db.query(ProjectScope).filter_by(ProjectId=projectId).first()
        if not scope:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scope not found for the given project."
            )

        scope.ScopeManagementPlan = scopeManagementPlan.model_dump()
        scope.RequirementManagementPlan = requirementManagementPlan.model_dump()
        scope.RequirementDocumentation = requirementDocumentation.model_dump()
        scope.ProjectScopeStatement = projectScopeStatement.model_dump()
        scope.WorkBreakdownStructure = workBreakdownStructure.model_dump()

        self.db.commit()
        self.db.refresh(scope)
        return scope

    def DeleteScope(self, projectId: str):
        scope = self.db.query(ProjectScope).filter_by(ProjectId=projectId).first()
        if not scope:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scope not found for the given project."
            )

        self.db.delete(scope)
        self.db.commit()

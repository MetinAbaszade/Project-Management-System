from sqlalchemy.orm import Session
from Models.ProjectScope import ProjectScope
from Models.ScopeManagementPlan import ScopeManagementPlan
from Models.RequirementDocument import RequirementDocument
from Models.ProjectScopeStatement import ProjectScopeStatement
from Models.WorkBreakdownStructure import WorkBreakdownStructure
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

        # Step 2: Create subcomponents
        scopePlan = ScopeManagementPlan(
            ScopePreparation=scopeManagementPlan.ScopeDefinitionMethod,
            WBSDevelopmentApproach=scopeManagementPlan.WBSDevelopmentMethod,
            ScopeBaselineApproval=scopeManagementPlan.ScopeBaselineApproval,
            DeliverableImpact=scopeManagementPlan.DeliverablesImpactHandling,
            ReqPlanningApproach=requirementManagementPlan.ReqPlanningApproach,
            ReqChangeControl=requirementManagementPlan.ReqChangeControl,
            ReqPrioritization=requirementManagementPlan.ReqPrioritization,
            ReqMetrics=requirementManagementPlan.ReqMetrics
        )

        requirementDoc = RequirementDocument(
            StakeholderNeeds="\n".join(requirementDocumentation.StakeholderNeeds),
            RequirementTraceability=requirementDocumentation.Traceability,
            RequirementAcceptanceCriteria="\n".join(requirementDocumentation.QuantifiedExpectations)
        )

        scopeStatement = ProjectScopeStatement(
            ScopeDescription=projectScopeStatement.EndProductScope,
            Deliverables="\n".join(projectScopeStatement.Deliverables),
            AcceptanceCriteria=projectScopeStatement.AcceptanceCriteria,
            Exclusions=projectScopeStatement.Exclusions,
            StatementOfWork=projectScopeStatement.OptionalSOW,
            IncludesSOW=bool(projectScopeStatement.OptionalSOW)
        )

        # Step 3: Create a single WBS row representing the overall structure
        wbs = WorkBreakdownStructure(
            WorkPackageName="Master WBS",
            WorkDescription="\n".join([wp.Description for wp in workBreakdownStructure.WorkPackages]),
            EstimatedDuration=sum([wp.EstimatedDuration or 0 for wp in workBreakdownStructure.WorkPackages]),
            EstimatedCost=sum([wp.EstimatedCost or 0 for wp in workBreakdownStructure.WorkPackages])
        )

        # Step 4: Save all subcomponents
        self.db.add_all([scopePlan, requirementDoc, scopeStatement, wbs])
        self.db.commit()

        # Step 5: Update ProjectScope with FKs
        newScope.ScopeManagementPlanId = scopePlan.Id
        newScope.RequirementDocumentId = requirementDoc.Id
        newScope.ScopeStatementId = scopeStatement.Id
        newScope.WBSId = wbs.Id

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

        # Update ScopeManagementPlan
        scopePlan: ScopeManagementPlan = self.db.query(ScopeManagementPlan).filter_by(Id=scope.ScopeManagementPlanId).first()
        if scopePlan:
            scopePlan.ScopePreparation = scopeManagementPlan.ScopeDefinitionMethod
            scopePlan.WBSDevelopmentApproach = scopeManagementPlan.WBSDevelopmentMethod
            scopePlan.ScopeBaselineApproval = scopeManagementPlan.ScopeBaselineApproval
            scopePlan.DeliverableImpact = scopeManagementPlan.DeliverablesImpactHandling
            scopePlan.ReqPlanningApproach = requirementManagementPlan.ReqPlanningApproach
            scopePlan.ReqChangeControl = requirementManagementPlan.ReqChangeControl
            scopePlan.ReqPrioritization = requirementManagementPlan.ReqPrioritization
            scopePlan.ReqMetrics = requirementManagementPlan.ReqMetrics

        # Update RequirementDocument
        requirementDoc: RequirementDocument = self.db.query(RequirementDocument).filter_by(Id=scope.RequirementDocumentId).first()
        if requirementDoc:
            requirementDoc.StakeholderNeeds = "\n".join(requirementDocumentation.StakeholderNeeds)
            requirementDoc.RequirementTraceability = requirementDocumentation.Traceability
            requirementDoc.RequirementAcceptanceCriteria = "\n".join(requirementDocumentation.QuantifiedExpectations)

        # Update ProjectScopeStatement
        scopeStatement: ProjectScopeStatement = self.db.query(ProjectScopeStatement).filter_by(Id=scope.ScopeStatementId).first()
        if scopeStatement:
            scopeStatement.ScopeDescription = projectScopeStatement.EndProductScope
            scopeStatement.Deliverables = "\n".join(projectScopeStatement.Deliverables)
            scopeStatement.AcceptanceCriteria = projectScopeStatement.AcceptanceCriteria
            scopeStatement.Exclusions = projectScopeStatement.Exclusions
            scopeStatement.StatementOfWork = projectScopeStatement.OptionalSOW
            scopeStatement.IncludesSOW = bool(projectScopeStatement.OptionalSOW)

        # Update WorkBreakdownStructure — assumes one WBS entry per scope
        wbs: WorkBreakdownStructure = self.db.query(WorkBreakdownStructure).filter_by(Id=scope.WBSId).first()
        if wbs and workBreakdownStructure.WorkPackages:
            wp = workBreakdownStructure.WorkPackages[0]
            wbs.WorkPackageName = wp.Name
            wbs.WorkDescription = wp.Description
            wbs.EstimatedDuration = wp.EstimatedDuration
            wbs.EstimatedCost = wp.EstimatedCost

        self.db.commit()
        self.db.refresh(scope)
        return scope
from fastapi import Depends, status, HTTPException
from sqlalchemy.orm import Session
from Dependencies.db import GetDb
from Repositories.ProjectScopeRepository import ProjectScopeRepository
from Models.ProjectScope import ProjectScope
from Schemas.ProjectScopeSchema import (
    ScopeManagementPlanSchema,
    RequirementManagementPlanSchema,
    RequirementDocumentSchema,
    ProjectScopeStatementSchema,
    WorkBreakdownStructureSchema,
    WorkPackageSchema,
    ScopeManagementPlanUpdateSchema,
    RequirementManagementPlanUpdateSchema,
    RequirementDocumentUpdateSchema,
    ProjectScopeStatementUpdateSchema,
    WorkBreakdownStructureUpdateSchema
)


class ProjectScopeService:

    def __init__(self, db: Session = Depends(GetDb)):
        self.db = db
        self.projectScopeRepository = ProjectScopeRepository(db)

    def GetScopeManagementPlan(self, projectId: str) -> ScopeManagementPlanSchema:
        scope = self.projectScopeRepository.GetProjectScope(projectId)
        if not scope or not scope.ScopeManagementPlanId:
            raise HTTPException(status_code=404, detail="Scope Management Plan not found.")

        plan = self.projectScopeRepository.GetScopeManagementPlan(scope.ScopeManagementPlanId)
        if not plan:
            raise HTTPException(status_code=404, detail="Scope Management Plan data missing.")

        return ScopeManagementPlanSchema(
            ScopeDefinitionMethod=plan.ScopePreparation,
            WBSDevelopmentMethod=plan.WBSDevelopmentApproach,
            ScopeBaselineApproval=plan.ScopeBaselineApproval,
            DeliverablesImpactHandling=plan.DeliverableImpact
        )

    def GetRequirementManagementPlan(self, projectId: str) -> RequirementManagementPlanSchema:
        scope = self.projectScopeRepository.GetProjectScope(projectId)
        if not scope or not scope.ScopeManagementPlanId:
            raise HTTPException(status_code=404, detail="Requirement Management Plan not found.")

        plan = self.projectScopeRepository.GetScopeManagementPlan(scope.ScopeManagementPlanId)
        if not plan:
            raise HTTPException(status_code=404, detail="Scope Management Plan not found for extracting requirements.")

        return RequirementManagementPlanSchema(
            ReqPlanningApproach=plan.ReqPlanningApproach,
            ReqChangeControl=plan.ReqChangeControl,
            ReqPrioritization=plan.ReqPrioritization,
            ReqMetrics=plan.ReqMetrics
        )

    def GetRequirementDocument(self, projectId: str) -> RequirementDocumentSchema:
        scope = self.projectScopeRepository.GetProjectScope(projectId)
        if not scope or not scope.RequirementDocumentId:
            raise HTTPException(status_code=404, detail="Requirement Documentation not found.")

        doc = self.projectScopeRepository.GetRequirementDocument(scope.RequirementDocumentId)
        if not doc:
            raise HTTPException(status_code=404, detail="Requirement document missing.")

        return RequirementDocumentSchema(
            StakeholderNeeds=doc.StakeholderNeeds.split("\n") if doc.StakeholderNeeds else [],
            QuantifiedExpectations=doc.RequirementAcceptanceCriteria.split("\n") if doc.RequirementAcceptanceCriteria else [],
            Traceability=doc.RequirementTraceability
        )

    def GetScopeStatement(self, projectId: str) -> ProjectScopeStatementSchema:
        scope = self.projectScopeRepository.GetProjectScope(projectId)
        if not scope or not scope.ScopeStatementId:
            raise HTTPException(status_code=404, detail="Project Scope Statement not found.")

        stmt = self.projectScopeRepository.GetScopeStatement(scope.ScopeStatementId)
        if not stmt:
            raise HTTPException(status_code=404, detail="Scope statement missing.")

        return ProjectScopeStatementSchema(
            EndProductScope=stmt.ScopeDescription,
            Deliverables=stmt.Deliverables.split("\n") if stmt.Deliverables else [],
            AcceptanceCriteria=stmt.AcceptanceCriteria,
            Exclusions=stmt.Exclusions,
            OptionalSOW=stmt.StatementOfWork
        )

    def GetWorkBreakdownStructure(self, projectId: str) -> WorkBreakdownStructureSchema:
        scope = self.projectScopeRepository.GetProjectScope(projectId)
        if not scope or not scope.WBSId:
            raise HTTPException(status_code=404, detail="Work Breakdown Structure not found.")

        wbs = self.projectScopeRepository.GetWBS(scope.WBSId)
        if not wbs:
            raise HTTPException(status_code=404, detail="WBS data missing.")

        return WorkBreakdownStructureSchema(
            WorkPackages=[
                WorkPackageSchema(
                    Name=wbs.WorkPackageName,
                    Description=wbs.WorkDescription,
                    EstimatedDuration=wbs.EstimatedDuration,
                )
            ],
            ScopeBaselineReference=None
        )

    def AddScopeManagementPlan(self, projectId: str, data: ScopeManagementPlanSchema):
        return self.projectScopeRepository.CreateScopeManagementPlan(projectId, data)

    def AddRequirementManagementPlan(self, projectId: str, data: RequirementManagementPlanSchema):
        return self.projectScopeRepository.CreateRequirementManagementPlan(projectId, data)

    def AddRequirementDocument(self, projectId: str, data: RequirementDocumentSchema):
        return self.projectScopeRepository.CreateRequirementDocument(projectId, data)

    def AddScopeStatement(self, projectId: str, data: ProjectScopeStatementSchema):
        return self.projectScopeRepository.CreateScopeStatement(projectId, data)

    def AddWorkBreakdownStructure(self, projectId: str, data: WorkBreakdownStructureSchema):
        return self.projectScopeRepository.CreateWorkBreakdownStructure(projectId, data)

    def EditScopeManagementPlan(self, projectId: str, data: ScopeManagementPlanUpdateSchema):
        self.EnsureScopeExists(projectId)
        return self.projectScopeRepository.UpdateScopeManagementPlan(projectId, data)

    def EditRequirementManagementPlan(self, projectId: str, data: RequirementManagementPlanUpdateSchema):
        self.EnsureScopeExists(projectId)
        return self.projectScopeRepository.UpdateRequirementManagementPlan(projectId, data)

    def EditRequirementDocument(self, projectId: str, data: RequirementDocumentUpdateSchema):
        self.EnsureScopeExists(projectId)
        return self.projectScopeRepository.UpdateRequirementDocument(projectId, data)

    def EditScopeStatement(self, projectId: str, data: ProjectScopeStatementUpdateSchema):
        self.EnsureScopeExists(projectId)
        return self.projectScopeRepository.UpdateScopeStatement(projectId, data)

    def EditWorkBreakdownStructure(self, projectId: str, data: WorkBreakdownStructureUpdateSchema):
        self.EnsureScopeExists(projectId)
        return self.projectScopeRepository.UpdateWorkBreakdownStructure(projectId, data)

    def EnsureScopeExists(self, projectId: str):
        scope = self.db.query(ProjectScope).filter_by(ProjectId=projectId).first()
        if not scope:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Scope does not exist for this project"
            )

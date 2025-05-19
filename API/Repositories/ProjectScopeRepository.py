from sqlalchemy.orm import Session
from Models.ProjectScope import ProjectScope
from Models.ScopeManagementPlan import ScopeManagementPlan
from Models.RequirementDocument import RequirementDocument
from Models.ProjectScopeStatement import ProjectScopeStatement
from Models.WorkBreakdownStructure import WorkBreakdownStructure
from Models.WorkPackage import WorkPackage
from Schemas.ProjectScopeSchema import *
from fastapi import HTTPException

class ProjectScopeRepository:

    def __init__(self, db: Session):
        self.db = db

    def GetScopeByProjectId(self, projectId: str) -> ProjectScope:
        return self.db.query(ProjectScope).filter_by(ProjectId=projectId).first()

    def GetScopeManagementPlan(self, planId: str) -> ScopeManagementPlan:
        return self.db.query(ScopeManagementPlan).filter_by(Id=planId).first()

    def GetRequirementDocument(self, docId: str) -> RequirementDocument:
        return self.db.query(RequirementDocument).filter_by(Id=docId).first()

    def GetScopeStatement(self, stmtId: str) -> ProjectScopeStatement:
        return self.db.query(ProjectScopeStatement).filter_by(Id=stmtId).first()

    def GetWBS(self, wbsId: str) -> WorkBreakdownStructure:
        return self.db.query(WorkBreakdownStructure).filter_by(Id=wbsId).first()

    def CreateScopeManagementPlan(self, projectId: str, data: ScopeManagementPlanSchema):
        scope = self.GetOrCreateScope(projectId)
        scopePlan = ScopeManagementPlan(
            ScopePreparation=data.ScopeDefinitionMethod,
            WBSDevelopmentApproach=data.WBSDevelopmentMethod,
            ScopeBaselineApproval=data.ScopeBaselineApproval,
            DeliverableImpact=data.DeliverablesImpactHandling
        )
        self.db.add(scopePlan)
        self.db.commit()
        self.db.refresh(scopePlan)
        scope.ScopeManagementPlanId = scopePlan.Id
        self.db.commit()
        return scopePlan

    def CreateRequirementManagementPlan(self, projectId: str, data: RequirementManagementPlanSchema):
        scope = self.GetOrCreateScope(projectId)
        plan: ScopeManagementPlan = self.db.query(ScopeManagementPlan).filter_by(Id=scope.ScopeManagementPlanId).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Scope Management Plan not found")

        plan.ReqPlanningApproach = data.ReqPlanningApproach
        plan.ReqChangeControl = data.ReqChangeControl
        plan.ReqPrioritization = data.ReqPrioritization
        plan.ReqMetrics = data.ReqMetrics

        self.db.commit()
        return plan

    def CreateRequirementDocument(self, projectId: str, data: RequirementDocumentSchema):
        scope = self.GetOrCreateScope(projectId)
        doc = RequirementDocument(
            StakeholderNeeds="\n".join(data.StakeholderNeeds),
            RequirementTraceability=data.Traceability,
            RequirementAcceptanceCriteria="\n".join(data.QuantifiedExpectations)
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        scope.RequirementDocumentId = doc.Id
        self.db.commit()
        return doc

    def CreateScopeStatement(self, projectId: str, data: ProjectScopeStatementSchema):
        scope = self.GetOrCreateScope(projectId)
        stmt = ProjectScopeStatement(
            ScopeDescription=data.EndProductScope,
            Deliverables="\n".join(data.Deliverables),
            AcceptanceCriteria=data.AcceptanceCriteria,
            Exclusions=data.Exclusions,
            StatementOfWork=data.OptionalSOW,
            IncludesSOW=bool(data.OptionalSOW)
        )
        self.db.add(stmt)
        self.db.commit()
        self.db.refresh(stmt)
        scope.ScopeStatementId = stmt.Id
        self.db.commit()
        return stmt

    def CreateWorkBreakdownStructure(self, projectId: str, data: WorkBreakdownStructureSchema):
        scope = self.GetOrCreateScope(projectId)

        wbs = WorkBreakdownStructure(
            WorkPackageName="Master WBS",
            WorkDescription="Auto-generated from work packages",
            EstimatedDuration=0,
        )
        self.db.add(wbs)
        self.db.commit()
        self.db.refresh(wbs)

        totalDuration = 0

        for wp in data.WorkPackages or []:
            package = WorkPackage(
                Name=wp.Name,
                Description=wp.Description,
                EstimatedDuration=wp.EstimatedDuration,
                WBSId=wbs.Id
            )
            totalDuration += wp.EstimatedDuration or 0
            self.db.add(package)

        wbs.EstimatedDuration = totalDuration

        self.db.commit()
        self.db.refresh(wbs)

        scope.WBSId = wbs.Id
        self.db.commit()
        return wbs

    def UpdateScopeManagementPlan(self, projectId: str, data: ScopeManagementPlanUpdateSchema):
        scope = self.GetScopeOr404(projectId)
        plan = self.db.query(ScopeManagementPlan).filter_by(Id=scope.ScopeManagementPlanId).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Scope Management Plan not found")

        update_fields = data.dict(exclude_unset=True)
        print("Update fields:", update_fields)

        for field, value in update_fields.items():
            if hasattr(plan, field):
                setattr(plan, field, value)

        self.db.commit()
        self.db.refresh(plan)
        return plan


    def UpdateRequirementManagementPlan(self, projectId: str, data: RequirementManagementPlanUpdateSchema):
        return self.UpdateScopeManagementPlan(projectId, data)

    def UpdateRequirementDocument(self, projectId: str, data: RequirementDocumentUpdateSchema):
        scope = self.GetScopeOr404(projectId)
        doc = self.db.query(RequirementDocument).filter_by(Id=scope.RequirementDocumentId).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Requirement Document not found")

        doc.StakeholderNeeds = "\n".join(data.StakeholderNeeds)
        doc.RequirementTraceability = data.Traceability
        doc.RequirementAcceptanceCriteria = "\n".join(data.QuantifiedExpectations)

        self.db.commit()
        return doc

    def UpdateScopeStatement(self, projectId: str, data: ProjectScopeStatementUpdateSchema):
        scope = self.GetScopeOr404(projectId)
        stmt = self.db.query(ProjectScopeStatement).filter_by(Id=scope.ScopeStatementId).first()
        if not stmt:
            raise HTTPException(status_code=404, detail="Scope Statement not found")

        for field, value in data.dict(exclude_unset=True).items():
            setattr(stmt, field, value)

        self.db.commit()
        return stmt

    def UpdateWorkBreakdownStructure(self, projectId: str, data: WorkBreakdownStructureUpdateSchema):
        scope = self.GetScopeOr404(projectId)
        wbs = self.db.query(WorkBreakdownStructure).filter_by(Id=scope.WBSId).first()
        if not wbs or not data.WorkPackages:
            raise HTTPException(status_code=404, detail="WBS not found or no work packages provided")

        wp = data.WorkPackages[0]
        wbs.WorkPackageName = wp.Name
        wbs.WorkDescription = wp.Description
        wbs.EstimatedDuration = wp.EstimatedDuration

        self.db.commit()
        return wbs

    def SoftDeleteScope(self, projectId: str):
        scope = self.db.query(ProjectScope).filter_by(ProjectId=projectId).first()
        if not scope:
            raise HTTPException(status_code=404, detail="Project scope not found")

        scope.IsDeleted = True
        scope.UpdatedAt = datetime.utcnow()

        if scope.ScopeManagementPlanId:
            plan = self.db.query(ScopeManagementPlan).filter_by(Id=scope.ScopeManagementPlanId).first()
            if plan:
                self.db.delete(plan)

        if scope.RequirementDocumentId:
            doc = self.db.query(RequirementDocument).filter_by(Id=scope.RequirementDocumentId).first()
            if doc:
                self.db.delete(doc)

        if scope.ScopeStatementId:
            stmt = self.db.query(ProjectScopeStatement).filter_by(Id=scope.ScopeStatementId).first()
            if stmt:
                self.db.delete(stmt)

        if scope.WBSId:
            wbs = self.db.query(WorkBreakdownStructure).filter_by(Id=scope.WBSId).first()
            if wbs:
                self.db.delete(wbs)

        self.db.commit()
        return {"message": "Project scope and its related components deleted successfully"}

    def GetOrCreateScope(self, projectId: str) -> ProjectScope:
        scope = self.db.query(ProjectScope).filter_by(ProjectId=projectId).first()
        if not scope:
            scope = ProjectScope(ProjectId=projectId)
            self.db.add(scope)
            self.db.commit()
            self.db.refresh(scope)
        return scope
    
    def GetProjectScope (self, projectId: str) -> ProjectScope:
        scope = self.db.query(ProjectScope).filter_by(ProjectId=projectId).first()
        return scope

    def GetScopeOr404(self, projectId: str) -> ProjectScope:
        scope = self.db.query(ProjectScope).filter_by(ProjectId=projectId).first()
        if not scope:
            raise HTTPException(status_code=404, detail="Project scope not found")
        return scope

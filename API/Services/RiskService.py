from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from uuid import UUID

from Models.Project import Project
from Repositories import RiskRepository, ProjectRepository
from Schemas.RiskSchema import (
    RiskBase, RiskUpdate,
    RiskAnalysisBase, RiskAnalysisUpdate,
    RiskResponsePlanBase, RiskResponsePlanUpdate
)
from Dependencies.db import GetDb


class RiskService:
    def __init__(self, db: Session = Depends(GetDb)):
        self.db = db

    def CreateRisk(self, userId: UUID, riskData: RiskBase):
        if not ProjectRepository.HasProjectAccess(self.db, riskData.ProjectId, str(userId)):
            raise HTTPException(status_code=403, detail="You are not a member of this project.")
        return RiskRepository.CreateRisk(self.db, riskData, str(userId))

    def UpdateRisk(self, userId: UUID, riskId: UUID, updateData: RiskUpdate):
        risk = RiskRepository.GetRiskById(self.db, str(riskId))
        if not risk:
            raise HTTPException(status_code=404, detail="Risk not found")

        if not ProjectRepository.HasProjectAccess(self.db, risk.ProjectId, str(userId)):
            raise HTTPException(status_code=403, detail="You are not a member of this project.")

        return RiskRepository.UpdateRisk(self.db, str(riskId), updateData)


    def SoftDeleteRisk(self, userId: UUID, riskId: UUID, projectId: UUID):
        if not ProjectRepository.HasProjectAccess(self.db, str(projectId), str(userId)):
            raise HTTPException(status_code=403, detail="You are not a member of this project.")

        # Step 1: Get the risk and confirm it exists
        risk = RiskRepository.GetRiskById(self.db, str(riskId))
        if not risk:
            raise HTTPException(status_code=404, detail="Risk not found")

        # Step 2: Soft delete the risk
        RiskRepository.SoftDeleteRisk(self.db, str(riskId))

        # Step 3: Soft delete related analyses
        analyses = RiskRepository.GetAllRiskAnalysesByRiskId(self.db, str(riskId))
        for analysis in analyses:
            RiskRepository.SoftDeleteRiskAnalysis(self.db, analysis.Id)

        # Step 4: Soft delete related response plans
        responsePlans = RiskRepository.GetAllRiskResponsePlansByRiskId(self.db, str(riskId))
        for plan in responsePlans:
            RiskRepository.SoftDeleteRiskResponsePlan(self.db, plan.Id)

        return {"message": "Risk and its related data soft deleted."}


    def GetRiskById(self, riskId: UUID):
        risk = RiskRepository.GetRiskById(self.db, str(riskId))
        if not risk:
            raise HTTPException(status_code=404, detail="Risk not found")
        return risk

    def GetAllRisks(self, projectId: str):
        return RiskRepository.GetAllRisks(self.db, projectId)

    #----------------------
    # RiskAnalysis

    def CreateRiskAnalysis(self, userId: UUID, analysisData: RiskAnalysisBase):
        # Analysis links to a Risk, and that Risk links to a Project
        risk = RiskRepository.GetRiskById(self.db, analysisData.RiskId)
        if not risk:
            raise HTTPException(status_code=404, detail="Risk not found")

        if not ProjectRepository.HasProjectAccess(self.db, risk.ProjectId, str(userId)):
            raise HTTPException(status_code=403, detail="You are not a member of the project for this risk.")
        return RiskRepository.CreateRiskAnalysis(self.db, analysisData)


    def UpdateRiskAnalysis(self, userId: UUID, analysisId: UUID, updateData: RiskAnalysisUpdate):
        analysis = RiskRepository.GetRiskAnalysisById(self.db, str(analysisId))
        if not analysis:
            raise HTTPException(status_code=404, detail="Risk analysis not found")

        risk = RiskRepository.GetRiskById(self.db, analysis.RiskId)
        if not risk:
            raise HTTPException(status_code=404, detail="Linked risk not found")

        if not ProjectRepository.HasProjectAccess(self.db, risk.ProjectId, str(userId)):
            raise HTTPException(status_code=403, detail="You are not a member of this project.")

        return RiskRepository.UpdateRiskAnalysis(self.db, str(analysisId), updateData)


    def SoftDeleteRiskAnalysis(self, userId: UUID, analysisId: UUID):
        analysis = RiskRepository.GetRiskAnalysisById(self.db, str(analysisId))
        if not analysis:
            raise HTTPException(status_code=404, detail="Risk analysis not found")

        risk = RiskRepository.GetRiskById(self.db, analysis.RiskId)
        if not risk:
            raise HTTPException(status_code=404, detail="Linked risk not found")

        if not ProjectRepository.HasProjectAccess(self.db, risk.ProjectId, str(userId)):
            raise HTTPException(status_code=403, detail="You are not a member of this project.")
        return RiskRepository.SoftDeleteRiskAnalysis(self.db, str(analysisId))

    def GetRiskAnalysisById(self, analysisId: UUID):
        analysis = RiskRepository.GetRiskAnalysisById(self.db, str(analysisId))
        if not analysis:
            raise HTTPException(status_code=404, detail="Risk analysis not found")
        return analysis

    def GetAllRiskAnalysesByRiskId(self, riskId: UUID):
        return RiskRepository.GetAllRiskAnalysesByRiskId(self.db, str(riskId))


    #----------------------
    # RiskResponsePlan
    def CreateRiskResponsePlan(self, userId: UUID, responseData: RiskResponsePlanBase):
        risk = RiskRepository.GetRiskById(self.db, responseData.RiskId)
        if not risk:
            raise HTTPException(status_code=404, detail="Risk not found")

        if not ProjectRepository.HasProjectAccess(self.db, risk.ProjectId, str(userId)):
            raise HTTPException(status_code=403, detail="You are not a member of this project.")
        return RiskRepository.CreateRiskResponsePlan(self.db, responseData)

    def UpdateRiskResponsePlan(self, userId: UUID, responseId: UUID, updateData: RiskResponsePlanUpdate):
        plan = RiskRepository.GetRiskResponsePlanById(self.db, str(responseId))
        if not plan:
            raise HTTPException(status_code=404, detail="Risk response plan not found")

        risk = RiskRepository.GetRiskById(self.db, plan.RiskId)
        if not risk:
            raise HTTPException(status_code=404, detail="Linked risk not found")

        if not ProjectRepository.HasProjectAccess(self.db, risk.ProjectId, str(userId)):
            raise HTTPException(status_code=403, detail="You are not a member of this project.")

        return RiskRepository.UpdateRiskResponsePlan(self.db, str(responseId), updateData)


    def SoftDeleteRiskResponsePlan(self, userId: UUID, responseId: UUID):
        plan = RiskRepository.GetRiskResponsePlanById(self.db, str(responseId))
        if not plan:
            raise HTTPException(status_code=404, detail="Risk response plan not found")

        risk = RiskRepository.GetRiskById(self.db, plan.RiskId)
        if not risk:
            raise HTTPException(status_code=404, detail="Linked risk not found")

        if not ProjectRepository.HasProjectAccess(self.db, risk.ProjectId, str(userId)):
            raise HTTPException(status_code=403, detail="You are not a member of this project.")
        return RiskRepository.SoftDeleteRiskResponsePlan(self.db, str(responseId))

    def GetRiskResponsePlanById(self, responseId: UUID):
        plan = RiskRepository.GetRiskResponsePlanById(self.db, str(responseId))
        if not plan:
            raise HTTPException(status_code=404, detail="Risk response plan not found")
        return plan

    def GetAllRiskResponsePlansByRiskId(self, riskId: UUID):
        return RiskRepository.GetAllRiskResponsePlansByRiskId(self.db, str(riskId))

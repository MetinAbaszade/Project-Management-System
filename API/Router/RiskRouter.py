from fastapi import APIRouter, Depends, status
from uuid import UUID

from Models import User
from Schemas.RiskSchema import (
    RiskBase, RiskUpdate,
    RiskAnalysisBase, RiskAnalysisUpdate,
    RiskResponsePlanBase, RiskResponsePlanUpdate
)
from Services.RiskService import RiskService
from Dependencies.auth import GetCurrentUser

router = APIRouter(prefix="/risks", tags=["Risks"])


# -----------------------------
# Risk Endpoints

@router.post("/create", status_code=status.HTTP_201_CREATED)
def CreateRisk(
    riskData: RiskBase,
    currentUser: User = Depends(GetCurrentUser),
    riskService: RiskService = Depends(RiskService)
):
    return riskService.CreateRisk(currentUser.Id, riskData)

@router.put("/{riskId}/update")
def UpdateRisk(
    riskId: UUID,
    riskData: RiskUpdate,
    currentUser: User = Depends(GetCurrentUser),
    riskService: RiskService = Depends(RiskService)
):
    return riskService.UpdateRisk(currentUser.Id, riskId, riskData)

@router.delete("/{riskId}/delete", status_code=status.HTTP_200_OK)
def DeleteRisk(
    riskId: UUID,
    projectId: UUID,
    currentUser: User = Depends(GetCurrentUser),
    riskService: RiskService = Depends(RiskService)
):
    return riskService.SoftDeleteRisk(currentUser.Id, riskId, projectId)

@router.get("/{riskId}", summary="Get risk by ID")
def GetRiskById(
    riskId: UUID,
    riskService: RiskService = Depends(RiskService)
):
    return riskService.GetRiskById(riskId)

@router.get("/project/{projectId}", summary="Get all risks by projectId")
def GetAllRisksByProject(
    projectId: str,
    riskService: RiskService = Depends(RiskService)
):
    return riskService.GetAllRisksByProject(projectId)



# -----------------------------
# RiskAnalysis Endpoints

@router.post("/analysis/create", status_code=status.HTTP_201_CREATED)
def CreateRiskAnalysis(
    analysisData: RiskAnalysisBase,
    currentUser: User = Depends(GetCurrentUser),
    riskService: RiskService = Depends(RiskService)
):
    return riskService.CreateRiskAnalysis(currentUser.Id, analysisData)

@router.put("/analysis/{analysisId}/update")
def UpdateRiskAnalysis(
    analysisId: UUID,
    analysisData: RiskAnalysisUpdate,
    currentUser: User = Depends(GetCurrentUser),
    riskService: RiskService = Depends(RiskService)
):
    return riskService.UpdateRiskAnalysis(currentUser.Id, analysisId, analysisData)

@router.delete("/analysis/{analysisId}/delete", status_code=status.HTTP_200_OK)
def DeleteRiskAnalysis(
    analysisId: UUID,
    currentUser: User = Depends(GetCurrentUser),
    riskService: RiskService = Depends(RiskService)
):
    return riskService.SoftDeleteRiskAnalysis(currentUser.Id, analysisId)

@router.get("/analysis/{analysisId}")
def GetRiskAnalysisById(
    analysisId: UUID,
    riskService: RiskService = Depends(RiskService)
):
    return riskService.GetRiskAnalysisById(analysisId)

@router.get("/{riskId}/analyses")
def GetAllRiskAnalyses(
    riskId: UUID,
    riskService: RiskService = Depends(RiskService)
):
    return riskService.GetAllRiskAnalysesByRiskId(riskId)


# -----------------------------
# RiskResponsePlan Endpoints

@router.post("/response/create", status_code=status.HTTP_201_CREATED)
def CreateRiskResponsePlan(
    responseData: RiskResponsePlanBase,
    currentUser: User = Depends(GetCurrentUser),
    riskService: RiskService = Depends(RiskService)
):
    return riskService.CreateRiskResponsePlan(currentUser.Id, responseData)

@router.put("/response/{responseId}/update")
def UpdateRiskResponsePlan(
    responseId: UUID,
    responseData: RiskResponsePlanUpdate,
    currentUser: User = Depends(GetCurrentUser),
    riskService: RiskService = Depends(RiskService)
):
    return riskService.UpdateRiskResponsePlan(currentUser.Id, responseId, responseData)

@router.delete("/response/{responseId}/delete", status_code=status.HTTP_200_OK)
def DeleteRiskResponsePlan(
    responseId: UUID,
    currentUser: User = Depends(GetCurrentUser),
    riskService: RiskService = Depends(RiskService)
):
    return riskService.SoftDeleteRiskResponsePlan(currentUser.Id, responseId)

@router.get("/response/{responseId}")
def GetRiskResponsePlanById(
    responseId: UUID,
    riskService: RiskService = Depends(RiskService)
):
    return riskService.GetRiskResponsePlanById(responseId)

@router.get("/{riskId}/responses")
def GetAllRiskResponsePlans(
    riskId: UUID,
    riskService: RiskService = Depends(RiskService)
):
    return riskService.GetAllRiskResponsePlansByRiskId(riskId)

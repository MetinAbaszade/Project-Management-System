from sqlalchemy.orm import Session
from Models.Risk import Risk
from Models.RiskAnalysis import RiskAnalysis
from Models.RiskResponsePlan import RiskResponsePlan
from Schemas.RiskSchema import (
    RiskBase, RiskUpdate,
    RiskAnalysisBase, RiskAnalysisUpdate,
    RiskResponsePlanBase, RiskResponsePlanUpdate
)
from Models.ProjectMember import ProjectMember
import uuid
from datetime import datetime

# -----------------------------
# Risk CRUD

def CreateRisk(db: Session, riskData: RiskBase, ownerId: str):
    newRisk = Risk(
        Id=str(uuid.uuid4()),
        ProjectId=riskData.ProjectId,
        Name=riskData.Name,
        Description=riskData.Description,
        Category=riskData.Category,
        Probability=riskData.Probability,
        Impact=riskData.Impact,
        Severity=riskData.Severity,
        OwnerId=ownerId,
        IdentifiedDate=datetime.utcnow(),
        Status=riskData.Status
    )
    db.add(newRisk)
    db.commit()
    db.refresh(newRisk)
    return newRisk

def UpdateRisk(db: Session, riskId: str, updateData: RiskUpdate):
    risk = db.query(Risk).filter(Risk.Id == riskId, Risk.IsDeleted == False).first()
    if not risk:
        return None
    for field, value in updateData.dict(exclude_unset=True).items():
        setattr(risk, field, value)
    db.commit()
    db.refresh(risk)
    return risk

def SoftDeleteRisk(db: Session, riskId: str):
    risk = db.query(Risk).filter(Risk.Id == riskId, Risk.IsDeleted == False).first()
    if not risk:
        return None
    risk.IsDeleted = True
    db.commit()
    return risk

def GetRiskById(db: Session, riskId: str):
    return db.query(Risk).filter(Risk.Id == riskId, Risk.IsDeleted == False).first()

def GetAllRisks(db: Session, projectId: str):
    return db.query(Risk).filter(Risk.ProjectId == projectId, Risk.IsDeleted == False).all()


# -----------------------------
# RiskAnalysis CRUD

def CreateRiskAnalysis(db: Session, analysisData: RiskAnalysisBase):
    newAnalysis = RiskAnalysis(
        Id=str(uuid.uuid4()),
        RiskId=analysisData.RiskId,
        AnalysisType=analysisData.AnalysisType,
        MatrixScore=analysisData.MatrixScore,
        ExpectedValue=analysisData.ExpectedValue,
        OwnerId=analysisData.OwnerId,
        AnalysisDate=datetime.utcnow()
    )
    db.add(newAnalysis)
    db.commit()
    db.refresh(newAnalysis)
    return newAnalysis

def UpdateRiskAnalysis(db: Session, analysisId: str, updateData: RiskAnalysisUpdate):
    analysis = db.query(RiskAnalysis).filter(RiskAnalysis.Id == analysisId, RiskAnalysis.IsDeleted == False).first()
    if not analysis:
        return None
    for field, value in updateData.dict(exclude_unset=True).items():
        setattr(analysis, field, value)
    db.commit()
    db.refresh(analysis)
    return analysis

def SoftDeleteRiskAnalysis(db: Session, analysisId: str):
    analysis = db.query(RiskAnalysis).filter(RiskAnalysis.Id == analysisId, RiskAnalysis.IsDeleted == False).first()
    if not analysis:
        return None
    analysis.IsDeleted = True
    db.commit()
    return analysis

def GetRiskAnalysisById(db: Session, analysisId: str):
    return db.query(RiskAnalysis).filter(RiskAnalysis.Id == analysisId, RiskAnalysis.IsDeleted == False).first()

def GetAllRiskAnalysesByRiskId(db: Session, riskId: str):
    return db.query(RiskAnalysis).filter(RiskAnalysis.RiskId == riskId, RiskAnalysis.IsDeleted == False).all()


# -----------------------------
# RiskResponsePlan CRUD

def CreateRiskResponsePlan(db: Session, responseData: RiskResponsePlanBase):
    newPlan = RiskResponsePlan(
        Id=str(uuid.uuid4()),
        RiskId=responseData.RiskId,
        Strategy=responseData.Strategy,
        Description=responseData.Description,
        OwnerId=responseData.OwnerId,
        PlannedActions=responseData.PlannedActions,
        Status=responseData.Status,
        CreatedAt=datetime.utcnow()
    )
    db.add(newPlan)
    db.commit()
    db.refresh(newPlan)
    return newPlan

def UpdateRiskResponsePlan(db: Session, responseId: str, updateData: RiskResponsePlanUpdate):
    plan = db.query(RiskResponsePlan).filter(RiskResponsePlan.Id == responseId, RiskResponsePlan.IsDeleted == False).first()
    if not plan:
        return None
    for field, value in updateData.dict(exclude_unset=True).items():
        setattr(plan, field, value)
    db.commit()
    db.refresh(plan)
    return plan

def SoftDeleteRiskResponsePlan(db: Session, responseId: str):
    plan = db.query(RiskResponsePlan).filter(RiskResponsePlan.Id == responseId, RiskResponsePlan.IsDeleted == False).first()
    if not plan:
        return None
    plan.IsDeleted = True
    db.commit()
    return plan

def GetRiskResponsePlanById(db: Session, responseId: str):
    return db.query(RiskResponsePlan).filter(RiskResponsePlan.Id == responseId, RiskResponsePlan.IsDeleted == False).first()

def GetAllRiskResponsePlansByRiskId(db: Session, riskId: str):
    return db.query(RiskResponsePlan).filter(RiskResponsePlan.RiskId == riskId, RiskResponsePlan.IsDeleted == False).all()



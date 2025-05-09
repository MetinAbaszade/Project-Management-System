from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# -----------------------------
# Risk Schemas

class RiskBase(BaseModel):
    ProjectId: str
    Name: str
    Description: Optional[str]
    Category: str
    Probability: float
    Impact: Optional[int] = 1
    Severity: float
    OwnerId: str
    Status: Optional[str] = "Open"

class RiskUpdate(BaseModel):
    Name: Optional[str]
    Description: Optional[str]
    Category: Optional[str]
    Probability: Optional[float]
    Impact: Optional[int]
    Severity: Optional[float]
    Status: Optional[str]

class RiskRead(RiskBase):
    Id: str
    IdentifiedDate: datetime

    class Config:
        orm_mode = True

# ---------------------------
# RiskAnalysis Schemas

class RiskAnalysisBase(BaseModel):
    RiskId: str
    AnalysisType: str
    MatrixScore: str
    ExpectedValue: float
    OwnerId: str


class RiskAnalysisUpdate(BaseModel):
    MatrixScore: Optional[str]
    ExpectedValue: Optional[float]

class RiskAnalysisRead(RiskAnalysisBase):
    Id: str
    AnalysisDate: datetime

    class Config:
        orm_mode = True

# ---------------------------
# RiskResponsePlan Schemas

class RiskResponsePlanBase(BaseModel):
    RiskId: str
    Strategy: str
    Description: Optional[str]
    OwnerId: str
    PlannedActions: str
    Status: Optional[str] = "Planned"

class RiskResponsePlanUpdate(BaseModel):
    Strategy: Optional[str]
    Description: Optional[str]
    PlannedActions: Optional[str]
    Status: Optional[str]

class RiskResponsePlanRead(RiskResponsePlanBase):
    Id: str
    CreatedAt: datetime

    class Config:
        orm_mode = True

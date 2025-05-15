from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal


# -------------------------------
# Resource Schemas
# -------------------------------

class ResourceBase(BaseModel):
    Name: str
    Type: str  
    ProjectId: str
    Description: Optional[str]
    Unit: str
    Total: float        
    Available: Optional[float]  

class ResourceUpdate(BaseModel):
    Name: Optional[str]
    Type: Optional[str]
    Description: Optional[str]
    Unit: Optional[str]
    Total: Optional[float]
    Available: Optional[float]

class ResourceRead(ResourceBase):
    Id: str
    CreatedAt: datetime

    class Config:
        orm_mode = True


# -------------------------------
# ActivityResource Schemas
# -------------------------------

class ActivityResourceBase(BaseModel):
    TaskId: str
    ResourceId: str
    Quantity: int
    EstimatedCost: int

class ActivityResourceUpdate(BaseModel):
    Quantity: Optional[float]
    EstimatedCost: Optional[float]

class ActivityResourceRead(ActivityResourceBase):
    Id: str
    AssignedAt: datetime

    class Config:
        orm_mode = True

class ActivityResourceResponse(BaseModel):
    Id: str
    TaskId: str
    ResourceId: str
    Quantity: Decimal
    EstimatedCost: Decimal
    AssignedAt: datetime
    IsDeleted: bool

    class Config:
        orm_mode = True


# -------------------------------
# ResourcePlan Schemas
# -------------------------------

class ResourcePlanBase(BaseModel):
    ProjectId: str
    Notes: Optional[str]
    OwnerId: str

class ResourcePlanUpdate(BaseModel):
    Notes: Optional[str]

class ResourcePlanRead(ResourcePlanBase):
    Id: str
    CreatedAt: datetime

    class Config:
        orm_mode = True

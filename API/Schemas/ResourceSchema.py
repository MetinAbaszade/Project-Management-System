from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# -------------------------------
# Resource Schemas
# -------------------------------

class ResourceBase(BaseModel):
    Name: str
    Type: str  
    Description: Optional[str]
    Unit: str
    Total: Optional[float] = None         
    Available: Optional[float] = None  

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
    Quantity: float
    EstimatedCost: float

class ActivityResourceUpdate(BaseModel):
    Quantity: Optional[float]
    EstimatedCost: Optional[float]

class ActivityResourceRead(ActivityResourceBase):
    Id: str
    AssignedAt: datetime

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

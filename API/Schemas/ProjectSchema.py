from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class ProjectCreate(BaseModel):
    Name: str
    Description: Optional[str] = None
    Deadline: Optional[datetime] = None
    StatusId: str
    TotalBudget: int = 0
    IsDeleted: Optional[bool] = False

    class Config:
        from_attributes = True


class ProjectUpdate(BaseModel):
    ProjectId: str
    Name: Optional[str]
    Description: Optional[str] = None
    Deadline: Optional[datetime] = None
    TotalBudget: Optional[int]
    class Config:
        from_attributes = True


class ProjectOut(BaseModel):
    Id: UUID
    Name: str
    Description: str
    Deadline: datetime
    TotalBudget: int
    CreatedAt: datetime
    IsDeleted: bool
    OwnerId: UUID

    class Config:
        from_attributes = True

# Add this to Schemas/ProjectSchema.py
class ProjectUpdate(BaseModel):
    Name: Optional[str] = None
    Description: Optional[str] = None
    Deadline: Optional[datetime] = None
    Budget: Optional[int] = None
    
    class Config:
        from_attributes = True

class ProjectOut(BaseModel):
    Id: UUID
    Name: str
    Description: str
    Deadline: datetime
    TotalBudget: int
    CreatedAt: datetime
    IsDeleted: bool
    OwnerId: UUID

    class Config:
        from_attributes = True
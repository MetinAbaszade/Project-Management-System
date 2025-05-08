from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class ProjectCreate(BaseModel):
    Name: str
    Description: Optional[str] = None
    Deadline: Optional[datetime] = None
    StatusId: str
    Budget: Optional[int] = 0
    IsDeleted: Optional[bool] = False

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

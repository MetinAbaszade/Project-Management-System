from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

from Schemas.ProjectStatusSchema import ProjectStatusOut


class ProjectCreate(BaseModel):
    Name: str
    Description: str = None
    Deadline: datetime = None
    Budget: int = 0
    IsDeleted: bool = False

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


class ProjectMemberCreate(BaseModel):
    UserId: UUID

    class Config:
        from_attributes = True

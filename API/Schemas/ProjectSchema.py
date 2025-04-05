from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

from Schemas.ProjectStatusSchema import ProjectStatusOut


class ProjectCreate(BaseModel):
    Name: str
    Description: Optional[str] = None
    Deadline: Optional[datetime] = None
    StatusId: UUID  
    Budget: Optional[int] = 0
    IsDeleted: Optional[bool] = False

    class Config:
        from_attributes = True


class ProjectOut(BaseModel):
    Id: UUID
    Name: str
    Description: Optional[str]
    Deadline: Optional[datetime]
    StatusId: UUID
    Budget: int
    CreatedAt: datetime
    IsDeleted: bool
    OwnerId: UUID

    class Config:
        from_attributes = True


class ProjectMemberCreate(BaseModel):
    UserId: UUID

    class Config:
        from_attributes = True

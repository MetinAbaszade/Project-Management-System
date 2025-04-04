from pydantic import BaseModel, model_validator
from typing import Optional
from datetime import date, datetime
from uuid import UUID

from Schemas.ProjectStatusSchema import ProjectStatusOut


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str]
    startDate: Optional[date]
    endDate: Optional[date]
    status: Optional[UUID]  
    budget: Optional[float]
    isPublic: Optional[bool] = False
    estimatedHours: Optional[float]

    @model_validator(mode="after")
    def check_dates(self):
        if self.startDate and self.endDate:
            if self.startDate == self.endDate:
                raise ValueError("StartDate and EndDate cannot be the same.")
            if self.startDate > self.endDate:
                raise ValueError("StartDate cannot be after EndDate.")
        return self


class ProjectOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    startDate: Optional[date]
    endDate: Optional[date]
    status: ProjectStatusOut  
    budget: Optional[float]
    budgetUsed: float
    isPublic: bool
    createdAt: datetime
    updatedAt: datetime
    estimatedHours: Optional[float]
    actualHours: float
    completionPercentage: float
    ownerId: UUID

    class Config:
        from_attributes = True  


class ProjectMemberCreate(BaseModel):
    userId: UUID
    roleInProject: str
    memberType: str = "Collaborator"

    class Config:
        from_attributes = True

from pydantic import BaseModel, field_validator, model_validator
from typing import Optional
from datetime import date, datetime
from Models.projects import ProjectStatus
from uuid import UUID

class ProjectCreate(BaseModel):
    Name: str
    Description: Optional[str]
    StartDate: Optional[date]
    EndDate: Optional[date]
    Status: Optional[ProjectStatus] = ProjectStatus.Planning
    Budget: Optional[float]
    IsPublic: Optional[bool] = False
    EstimatedHours: Optional[float]

    @model_validator(mode="after")
    def check_dates(cls, values):
        start_date = values.get("StartDate")
        end_date = values.get("EndDate")

        if start_date and end_date:
            if start_date == end_date:
                raise ValueError("StartDate and EndDate cannot be the same.")
            if start_date > end_date:
                raise ValueError("StartDate cannot be after EndDate.")

        return values

class ProjectOut(BaseModel):
    Id: UUID
    Name: str
    Description: Optional[str]
    StartDate: Optional[date]
    EndDate: Optional[date]
    Status: ProjectStatus
    Budget: Optional[float]
    BudgetUsed: float
    IsPublic: bool
    CreatedAt: datetime
    UpdatedAt: datetime
    EstimatedHours: Optional[float]
    ActualHours: float
    CompletionPercentage: float
    OwnerId: UUID

    class Config:
        orm_mode = True


class ProjectMemberCreate(BaseModel):
    UserId: UUID
    RoleInProject: str
    MemberType: str = "Collaborator" 

    class Config:
        from_attributes = True  

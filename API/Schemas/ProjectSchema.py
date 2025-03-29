from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from Models.projects import ProjectStatus

# class ProjectStatus(str, Enum):
#     Planning = 'Planning'
#     Active = 'Active'
#     OnHold = 'On Hold'
#     Completed = 'Completed'
#     Canceled = 'Canceled'

class ProjectCreate(BaseModel):
    Name: str
    Description: Optional[str]
    StartDate: Optional[date]
    EndDate: Optional[date]
    Status: Optional[ProjectStatus] = ProjectStatus.Planning
    Budget: Optional[float]
    IsPublic: Optional[bool] = False
    EstimatedHours: Optional[float]

class ProjectOut(BaseModel):
    Id: int
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
    OwnerId: int

    class Config:
        orm_mode = True


class ProjectMemberCreate(BaseModel):
    UserId: int
    RoleInProject: str
    MemberType: str = "Collaborator"  # Optional with default

    class Config:
        from_attributes = True  # Pydantic v2

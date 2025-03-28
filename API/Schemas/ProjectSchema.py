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
    name: str
    description: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    status: Optional[ProjectStatus] = ProjectStatus.Planning
    budget: Optional[float]
    is_public: Optional[bool] = False
    estimated_hours: Optional[float]

class ProjectOut(BaseModel):
    project_id: int
    name: str
    description: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    status: ProjectStatus
    budget: Optional[float]
    budget_used: float
    is_public: bool
    created_at: datetime
    updated_at: datetime
    estimated_hours: Optional[float]
    actual_hours: float
    completion_percentage: float
    owner_id: int

    class Config:
        orm_mode = True

class ProjectMemberCreate(BaseModel):
    user_id: int
    role_in_project: str
    member_type: str = "Collaborator"  # Optional with default

    class Config:
        from_attributes = True  # Pydantic v2


from pydantic import BaseModel
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from uuid import UUID

if TYPE_CHECKING:
    from Schemas.TaskSchema import TaskTreeResponse

class TaskBase(BaseModel):
    Title: str
    Description: Optional[str] = None
    Cost: Optional[float] = 0.0
    Status: str
    StatusColorHex: Optional[str] = None
    Priority: str
    PriorityColorHex: Optional[str] = None
    Deadline: Optional[datetime] = None
    TeamId: Optional[UUID] = None
    UserId: Optional[UUID] = None
    ParentTaskId: Optional[UUID] = None

class TaskCreate(TaskBase):
    ProjectId: UUID

class TaskUpdate(TaskBase):
    Title: Optional[str] = None
    Status: Optional[str] = None
    Priority: Optional[str] = None

class TaskResponse(TaskBase):
    Id: UUID
    CreatedAt: datetime
    UpdatedAt: Optional[datetime]
    Completed: bool
    IsDeleted: bool

    class Config:
        orm_mode = True

class TaskTreeResponse(TaskResponse):
    Subtasks: List["TaskTreeResponse"] = []

    class Config:
        orm_mode = True

TaskTreeResponse.update_forward_refs()

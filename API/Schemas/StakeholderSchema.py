from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime

class StakeholderCreate(BaseModel):
    ProjectId: UUID
    UserId: UUID
    Percentage: float

class StakeholderUpdate(BaseModel):
    Percentage: Optional[float] = None

class StakeholderResponse(StakeholderCreate):
    Id: UUID
    CreatedAt: datetime
    UpdatedAt: Optional[datetime]

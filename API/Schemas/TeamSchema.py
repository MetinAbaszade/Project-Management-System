from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class TeamCreate(BaseModel):
    Name: str
    Description: Optional[str]
    ColorIndex: Optional[int] = 0
    ProjectId: UUID

class TeamUpdate(BaseModel):
    Name: Optional[str]
    Description: Optional[str]
    ColorIndex: Optional[int]

class TeamResponse(TeamCreate):
    Id: str
    CreatedAt: datetime
    UpdatedAt: Optional[datetime]
    IsDeleted: bool

class AddTeamMember(BaseModel):
    TeamId: UUID
    UserIdToBeAdded: UUID
    Role: str
    IsLeader: bool

class RemoveTeamMember(BaseModel):
    TeamId: UUID
    UserIdToBeRemoved: UUID

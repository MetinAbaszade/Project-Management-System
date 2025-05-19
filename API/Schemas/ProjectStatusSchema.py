from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class ProjectStatusOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str]

    class Config:
        from_attributes = True

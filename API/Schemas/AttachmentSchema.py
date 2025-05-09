from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from Models.Attachment import AttachmentEntityType


class AttachmentCreateSchema(BaseModel):
    FileName: str
    FileType: Optional[str]
    FileSize: Optional[int]
    FilePath: str
    EntityType: AttachmentEntityType
    EntityId: str
    OwnerId: str
    ProjectId: str 


class AttachmentResponseSchema(BaseModel):
    Id: str
    FileName: str
    FileType: Optional[str]
    FileSize: Optional[int]
    FilePath: str
    EntityType: AttachmentEntityType
    EntityId: str
    OwnerId: str
    UploadedAt: datetime

    class Config:
        orm_mode = True

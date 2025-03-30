from pydantic import BaseModel
import uuid


class LanguageBase(BaseModel):
    LanguageName: str
    LanguageCode: str
    IsDeleted: bool = True
    DisplayOrder: int = 0

class LanguageCreate(LanguageBase):
    pass

class LanguageResponse(LanguageBase):
    Id: uuid.UUID

    class Config:
        from_attributes = True

from pydantic import BaseModel

class LanguageBase(BaseModel):
    language_name: str
    language_code: str
    is_active: bool = True
    display_order: int = 0

class LanguageCreate(LanguageBase):
    pass

class LanguageResponse(LanguageBase):
    language_id: int

    class Config:
        from_attributes = True

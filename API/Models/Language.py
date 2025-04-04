import uuid
from sqlalchemy import Column, String, Integer, Boolean
from Db.session import Base

class Language(Base):
    __tablename__ = "Language"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    LanguageName = Column(String(50), unique=True, nullable=False)
    LanguageCode = Column(String(10), unique=True, nullable=False)
    IsDeleted = Column(Boolean, default=True)
    DisplayOrder = Column(Integer, default=0)
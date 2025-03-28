import uuid
from sqlalchemy import Column, String, Integer, Boolean
from Db.session import Base

class Language(Base):
    __tablename__ = "languages"

    Id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    LanguageName = Column(String(50), unique=True, nullable=False)
    LanguageCode = Column(String(10), unique=True, nullable=False)
    IsDeleted = Column(Boolean, default=True)
    DisplayOrder = Column(Integer, default=0)

    IsDeleted = Column(Boolean, default=False)

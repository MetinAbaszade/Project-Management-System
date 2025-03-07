from sqlalchemy import Column, Integer, String, Boolean
from Db.session import Base

class Language(Base):
    __tablename__ = "languages"

    language_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    language_name = Column(String(50), unique=True, nullable=False)
    language_code = Column(String(10), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from Db.session import Base

class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, autoincrement=True)
    role_name = Column(String(50), nullable=False, unique=True)
    is_admin = Column(Boolean, default=False)
    description = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

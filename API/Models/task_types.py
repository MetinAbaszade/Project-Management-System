from sqlalchemy import Column, Integer, String, DateTime, Boolean
from Db.session import Base
from datetime import datetime

class TaskType(Base):
    __tablename__ = "task_types"

    type_id = Column(Integer, primary_key=True, autoincrement=True)
    type_name = Column(String(50), nullable=False, unique=True)
    description = Column(String(255))
    color = Column(String(7))
    icon = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

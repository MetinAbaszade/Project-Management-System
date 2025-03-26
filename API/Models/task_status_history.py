from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base
from datetime import datetime

class TaskStatusHistory(Base):
    __tablename__ = "task_status_history"

    history_id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.task_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    old_status = Column(String(20), nullable=False)
    new_status = Column(String(20), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)
    time_in_status = Column(Integer)

    # Relationships
    task = relationship("Task", backref="status_history", foreign_keys=[task_id])
    user = relationship("User", foreign_keys=[user_id])

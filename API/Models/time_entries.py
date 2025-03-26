from sqlalchemy import Column, Integer, Float, Date, Time, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base
from datetime import datetime

class TimeEntry(Base):
    __tablename__ = "time_entries"

    time_entry_id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.task_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    time_spent = Column(Float, nullable=False)
    entry_date = Column(Date, nullable=False)
    start_time = Column(Time)
    end_time = Column(Time)
    description = Column(Text)
    billable = Column(Boolean, default=True)
    approved_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    approved_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    task = relationship("Task", backref="time_entries", foreign_keys=[task_id])
    user = relationship("User", foreign_keys=[user_id])
    approver = relationship("User", foreign_keys=[approved_by])

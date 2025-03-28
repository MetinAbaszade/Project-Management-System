import uuid
from sqlalchemy import Column, String, Float, Date, Time, Text, Boolean, DateTime, ForeignKey
from datetime import datetime
from Db.session import Base
from sqlalchemy.orm import relationship

class TimeEntry(Base):
    __tablename__ = "TimeEntries"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    TaskId = Column(String(36), ForeignKey("Tasks.Id"), nullable=False)
    UserId = Column(String(36), ForeignKey("Users.Id"), nullable=False)
    TimeSpent = Column(Float, nullable=False)
    EntryDate = Column(Date, nullable=False)
    StartTime = Column(Time)
    EndTime = Column(Time)
    Description = Column(Text)
    Billable = Column(Boolean, default=True)
    ApprovedBy = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    ApprovedAt = Column(DateTime)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    # Relationships
    Task = relationship("Task", backref="TimeEntries", foreign_keys=[TaskId])
    User = relationship("User", foreign_keys=[UserId])
    Approver = relationship("User", foreign_keys=[ApprovedBy])
import uuid
from sqlalchemy import Boolean, Column, String, DateTime, ForeignKey, PrimaryKeyConstraint
from datetime import datetime
from Db.session import Base
from sqlalchemy.orm import relationship

class TaskLabel(Base):
    __tablename__ = "TaskLabels"
    TaskId = Column(String(36), ForeignKey("Tasks.Id"), nullable=False)
    LabelId = Column(String(36), ForeignKey("Labels.Id"), nullable=False)
    AddedBy = Column(String(36), ForeignKey("Users.Id"), nullable=True)

    
    IsDeleted = Column(Boolean, default=False)
    
    AddedAt = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (
        PrimaryKeyConstraint('TaskId', 'LabelId'),
    )
    Task = relationship("Task", backref="TaskLabels", foreign_keys=[TaskId])
    Label = relationship("Label", backref="TaskLabels", foreign_keys=[LabelId])
    Adder = relationship("User", foreign_keys=[AddedBy])

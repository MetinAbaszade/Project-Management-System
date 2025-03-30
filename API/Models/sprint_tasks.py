import uuid
from sqlalchemy import Boolean, Column, String, DateTime, ForeignKey, PrimaryKeyConstraint, Float
from datetime import datetime
from Db.session import Base
from sqlalchemy.orm import relationship

class SprintTask(Base):
    __tablename__ = "SprintTasks"
    SprintId = Column(String(36), ForeignKey("Sprints.Id"), nullable=False)
    TaskId = Column(String(36), ForeignKey("Tasks.Id"), nullable=False)
    AddedBy = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    AddedAt = Column(DateTime, default=datetime.utcnow)
    StoryPoints = Column(Float)
    
    IsDeleted = Column(Boolean, default=False)
    
    __table_args__ = (
        PrimaryKeyConstraint('SprintId', 'TaskId'),
    )
    Sprint = relationship("Sprint", backref="SprintTasks", foreign_keys=[SprintId])
    Task = relationship("Task", foreign_keys=[TaskId])
    Adder = relationship("User", foreign_keys=[AddedBy])

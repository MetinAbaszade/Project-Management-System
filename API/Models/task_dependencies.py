import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, PrimaryKeyConstraint, Enum
from datetime import datetime
from Db.session import Base
import enum
from sqlalchemy.orm import relationship

class DependencyType(enum.Enum):
    Blocks = "Blocks"
    Is_blocked_by = "Is blocked by"
    Relates_to = "Relates to"

class TaskDependency(Base):
    __tablename__ = "TaskDependencies"
    TaskId = Column(String(36), ForeignKey("Tasks.Id"), nullable=False)
    DependentTaskId = Column(String(36), ForeignKey("Tasks.Id"), nullable=False)
    DependencyType = Column(Enum(DependencyType), default=DependencyType.Blocks)
    CreatedBy = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (
        PrimaryKeyConstraint('TaskId', 'DependentTaskId'),
    )
    task = relationship("Task", foreign_keys=[TaskId], backref="Dependencies")

    #error cixsa dependent_task a deyis
    DependentTask = relationship("Task", foreign_keys=[DependentTaskId])
    Creator = relationship("User", foreign_keys=[CreatedBy])

from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum, PrimaryKeyConstraint
from sqlalchemy.orm import relationship
from Db.session import Base
from datetime import datetime
import enum

class DependencyType(enum.Enum):
    Blocks = "Blocks"
    IsBlockedBy = "Is blocked by"
    RelatesTo = "Relates to"

class TaskDependency(Base):
    __tablename__ = "task_dependencies"

    task_id = Column(Integer, ForeignKey("tasks.task_id"), nullable=False)
    dependent_task_id = Column(Integer, ForeignKey("tasks.task_id"), nullable=False)
    dependency_type = Column(Enum(DependencyType), default=DependencyType.Blocks)
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        PrimaryKeyConstraint('task_id', 'dependent_task_id'),
    )

    # Relationships
    task = relationship("Task", foreign_keys=[task_id], backref="dependencies")
    dependent_task = relationship("Task", foreign_keys=[dependent_task_id])
    creator = relationship("User", foreign_keys=[created_by])

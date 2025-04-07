import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class TaskAssignment(Base):

    __tablename__ = "TaskAssignment"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    TaskId = Column(String(36), ForeignKey("Task.Id", ondelete="CASCADE"), nullable=False)
    UserId = Column(String(36), ForeignKey("User.Id", ondelete="CASCADE"), nullable=False)
    AssignedAt = Column(DateTime, default=datetime.utcnow)
    AssignedBy = Column(String(36), ForeignKey("User.Id"), nullable=False)

    # Relationships
    Task = relationship("Task")
    User = relationship("User")
    Assigner = relationship("User", foreign_keys=[AssignedBy])

    #  unique user per task
    __table_args__ = (
        {"sqlite_autoincrement": True},
    )
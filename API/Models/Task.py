import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from Db.session import Base


class Task(Base):

    __tablename__ = "Task"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False)
    TeamId = Column(String(36), ForeignKey("Team.Id", ondelete="CASCADE"), nullable=True)
    UserId = Column(String(36), ForeignKey("User.Id", ondelete="CASCADE"), nullable=True)
    CreatedBy = Column(String(36), ForeignKey("User.Id"), nullable=False)

    Title = Column(String(100), nullable=False)
    Description = Column(Text)
    Cost = Column(Float, default=0.0)
    Status = Column(String(50), nullable=False)  # 'Not Started', 'In Progress', 'Completed'
    StatusColorHex = Column(String(7))
    Priority = Column(String(50), nullable=False)  # 'Low', 'Medium', 'High'
    PriorityColorHex = Column(String(7))
    ParentTaskId = Column(String(36), ForeignKey("Task.Id", ondelete="CASCADE"), nullable=True)
    Deadline = Column(DateTime)
    CreatedAt = Column(DateTime, default=datetime.now())
    UpdatedAt = Column(DateTime, onupdate=datetime.now())
    IsDeleted = Column(Boolean, default=False)
    Completed = Column(Boolean, default=False)

    # Relationships
    Project = relationship("Project", back_populates="Tasks")
    Team = relationship("Team", back_populates="Tasks")
    User = relationship("User", foreign_keys=[UserId])

    Subtasks = relationship(
        "Task",
        back_populates="ParentTask",
        cascade="all, delete-orphan",
        single_parent=True
    )

    ParentTask = relationship(
        "Task",
        remote_side=[Id],
        back_populates="Subtasks"
    )

    Creator = relationship("User", foreign_keys=[CreatedBy], back_populates="TasksCreated", overlaps="TasksAssigned")
    AssignedResources = relationship("ActivityResource", back_populates="Task", cascade="all, delete-orphan")

    # Predefined statuses
    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"

    # Predefined priorities
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


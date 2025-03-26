from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.orm import relationship
from Db.session import Base
from datetime import datetime

class SprintTask(Base):
    __tablename__ = "sprint_tasks"

    sprint_id = Column(Integer, ForeignKey("sprints.sprint_id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.task_id"), nullable=False)
    added_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    added_at = Column(DateTime, default=datetime.utcnow)
    story_points = Column(Float)

    __table_args__ = (
        PrimaryKeyConstraint('sprint_id', 'task_id'),
    )

    # Relationships
    sprint = relationship("Sprint", backref="sprint_tasks", foreign_keys=[sprint_id])
    task = relationship("Task", foreign_keys=[task_id])
    adder = relationship("User", foreign_keys=[added_by])

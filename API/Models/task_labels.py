from sqlalchemy import Column, Integer, DateTime, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.orm import relationship
from Db.session import Base
from datetime import datetime

class TaskLabel(Base):
    __tablename__ = "task_labels"

    task_id = Column(Integer, ForeignKey("tasks.task_id"), nullable=False)
    label_id = Column(Integer, ForeignKey("labels.label_id"), nullable=False)
    added_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    added_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        PrimaryKeyConstraint('task_id', 'label_id'),
    )

    # Relationships
    task = relationship("Task", backref="task_labels", foreign_keys=[task_id])
    label = relationship("Label", backref="task_labels", foreign_keys=[label_id])
    adder = relationship("User", foreign_keys=[added_by])

from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Float, Enum, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base
import enum
from datetime import datetime

class SprintStatus(enum.Enum):
    Planning = "Planning"
    Active = "Active"
    Completed = "Completed"
    Canceled = "Canceled"

class Sprint(Base):
    __tablename__ = "sprints"

    sprint_id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    name = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    goal = Column(Text)
    status = Column(Enum(SprintStatus), default=SprintStatus.Planning)
    capacity = Column(Float)
    velocity = Column(Float)
    retrospective_notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

    # Relationships
    project = relationship("Project", backref="sprints", foreign_keys=[project_id])
    creator = relationship("User", foreign_keys=[created_by])

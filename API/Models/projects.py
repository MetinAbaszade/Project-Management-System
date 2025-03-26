from sqlalchemy import Column, Integer, String, Text, Date, Enum, DECIMAL, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base
import enum

# Define an Enum for project status
class ProjectStatus(enum.Enum):
    Planning = 'Planning'
    Active = 'Active'
    OnHold = 'On Hold'
    Completed = 'Completed'
    Canceled = 'Canceled'

class Project(Base):
    __tablename__ = "projects"

    project_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.Planning)
    budget = Column(DECIMAL(15, 2))
    budget_used = Column(DECIMAL(15, 2), default=0)
    owner_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default="CURRENT_TIMESTAMP")
    updated_at = Column(DateTime, server_default="CURRENT_TIMESTAMP", server_onupdate="CURRENT_TIMESTAMP")
    estimated_hours = Column(Float)
    actual_hours = Column(Float, default=0)
    completion_percentage = Column(Float, default=0)

    # Relationships
    owner = relationship("User", back_populates="projects_owned", foreign_keys=[owner_id])

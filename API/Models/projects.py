from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    Enum,
    DECIMAL,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    text  # ✅ Needed for CURRENT_TIMESTAMP default
)
from sqlalchemy.orm import relationship
from Db.session import Base
import enum

# ✅ Enum for project status
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
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ Matches your User model now
    is_public = Column(Boolean, default=False)

    # ✅ FIXED TIMESTAMP DEFAULTS
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), server_onupdate=text("CURRENT_TIMESTAMP"))

    estimated_hours = Column(Float)
    actual_hours = Column(Float, default=0)
    completion_percentage = Column(Float, default=0)

    # ✅ Relationship to User
    owner = relationship("User", back_populates="projects_owned", foreign_keys=[owner_id])

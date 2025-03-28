import uuid
from sqlalchemy import Column, String, Text, Date, Enum, DECIMAL, Boolean, DateTime, Float, ForeignKey, text
from datetime import datetime
from Db.session import Base
import enum
from sqlalchemy.orm import relationship

class ProjectStatus(enum.Enum):
    Planning = 'Planning'
    Active = 'Active'
    On_Hold = 'On Hold'
    Completed = 'Completed'
    Canceled = 'Canceled'

class Project(Base):
    __tablename__ = "Projects"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Name = Column(String(100), nullable=False)
    Description = Column(Text)
    StartDate = Column(Date)
    EndDate = Column(Date)
    Status = Column(Enum(ProjectStatus), default=ProjectStatus.Planning)
    Budget = Column(DECIMAL(15, 2))
    BudgetUsed = Column(DECIMAL(15, 2), default=0)
    OwnerId = Column(String(36), ForeignKey("Users.Id"), nullable=False)
    IsPublic = Column(Boolean, default=False)
    CreatedAt = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    UpdatedAt = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), server_onupdate=text("CURRENT_TIMESTAMP"))
    EstimatedHours = Column(Float)
    ActualHours = Column(Float, default=0)
    CompletionPercentage = Column(Float, default=0)
    owner = relationship("User", back_populates="ProjectsOwned", foreign_keys=[OwnerId])



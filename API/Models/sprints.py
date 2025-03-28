import uuid
from sqlalchemy import Column, String, Date, DateTime, Float, Text, Enum, ForeignKey
from datetime import datetime
from Db.session import Base
import enum
from sqlalchemy.orm import relationship

class SprintStatus(enum.Enum):
    Planning = "Planning"
    Active = "Active"
    Completed = "Completed"
    Canceled = "Canceled"

class Sprint(Base):
    __tablename__ = "Sprints"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Projects.Id"), nullable=False)
    Name = Column(String(100), nullable=False)
    StartDate = Column(Date, nullable=False)
    EndDate = Column(Date, nullable=False)
    Goal = Column(Text)
    Status = Column(Enum(SprintStatus), default=SprintStatus.Planning)
    Capacity = Column(Float)
    Velocity = Column(Float)
    RetrospectiveNotes = Column(Text)
    CreatedBy = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    CompletedAt = Column(DateTime)
    Project = relationship("Project", backref="Sprints", foreign_keys=[ProjectId])
    Creator = relationship("User", foreign_keys=[CreatedBy])

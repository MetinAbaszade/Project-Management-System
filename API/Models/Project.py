import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from Db.session import Base


class Project(Base):
    __tablename__ = "Project"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Name = Column(String(100), nullable=False)
    Description = Column(Text)

    Deadline = Column(DateTime)  # ✅ Add this line back

    Progress = Column(Integer, default=0)
    TotalBudget = Column(Numeric(12, 2), default=0)
    RemainingBudget = Column(Numeric(12, 2), default=0)
    
    Status = Column(String(50), default="Not Started")
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, onupdate=datetime.utcnow)
    CreatedBy = Column(String(36), ForeignKey("User.Id"), nullable=False)
    IsDeleted = Column(Boolean, default=False)

    # Relationships
    Tasks = relationship("Task", back_populates="Project", cascade="all, delete-orphan")
    Teams = relationship("Team", back_populates="Project", cascade="all, delete-orphan")
    Stakeholders = relationship("ProjectStakeholder", back_populates="Project", cascade="all, delete-orphan")
    Creator = relationship("User", foreign_keys=[CreatedBy], back_populates="ProjectsCreated")
    Scope = relationship("ProjectScope", back_populates="Project", uselist=False, cascade="all, delete-orphan")
    Members = relationship("ProjectMember", back_populates="Project", cascade="all, delete-orphan")

    # Predefined status values
    STATUS_NOT_STARTED = "Not Started"
    STATUS_IN_PROGRESS = "In Progress"
    STATUS_COMPLETED = "Completed"
    STATUS_ON_HOLD = "On Hold"

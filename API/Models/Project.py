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
    RemainingBudget = Column(Numeric(12, 2), default=TotalBudget)

    CreatedAt = Column(DateTime, default=datetime.now())
    UpdatedAt = Column(DateTime, onupdate=datetime.now())
    IsDeleted = Column(Boolean, default=False)
    OwnerId = Column(String(36), ForeignKey("User.Id"), nullable=False)

    # Relationships
    Tasks = relationship("Task", back_populates="Project", cascade="all, delete-orphan")
    Teams = relationship("Team", back_populates="Project", cascade="all, delete-orphan")
    Stakeholders = relationship("ProjectStakeholder", back_populates="Project", cascade="all, delete-orphan")
    Creator = relationship("User", back_populates="ProjectsCreated")
    Scope = relationship("ProjectScope", back_populates="Project", uselist=False, cascade="all, delete-orphan")
    Members = relationship("ProjectMember", back_populates="Project", cascade="all, delete-orphan")
    Attachments = relationship("Attachment", back_populates="Project")
    Resources = relationship("Resource", back_populates="Project", cascade="all, delete-orphan")
    ResourcePlans = relationship("ResourcePlan", back_populates="Project", cascade="all, delete-orphan")

    # Predefined status values
    STATUS_NOT_STARTED = "Not Started"
    STATUS_IN_PROGRESS = "In Progress"
    STATUS_COMPLETED = "Completed"
    STATUS_ON_HOLD = "On Hold"

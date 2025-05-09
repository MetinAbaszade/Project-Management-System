import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship
from Db.session import Base

class Resource(Base):
    __tablename__ = "Resource"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id"), nullable=False)  # ✅ NEW
    Name = Column(String, nullable=False)
    Type = Column(String, nullable=False)  # e.g. Human, Equipment, Material
    Total = Column(Float, nullable=True)     # Total quantity in stock
    Available = Column(Float, nullable=True) # Available quantity ready for use
    Description = Column(String)
    Unit = Column(String)
    IsDeleted = Column(Boolean, default=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)

    # Relationships
    ActivityAssignments = relationship("ActivityResource", back_populates="Resource", cascade="all, delete-orphan")
    Project = relationship("Project", back_populates="Resources")

    # project.py
    # Resources = relationship("Resource", back_populates="Project", cascade="all, delete-orphan")

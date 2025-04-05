import uuid
from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from Db.session import Base


class ProjectStatus(Base):
    __tablename__ = "ProjectStatus"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Name = Column(String(50), unique=True, nullable=False)
    Description = Column(Text)

    # Relationships
    Project = relationship("Project", back_populates="ProjectStatus", cascade="all, delete-orphan")

import uuid
from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from Db.session import Base


class Role(Base):
    __tablename__ = "Role"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Name = Column(String(50), unique=True, nullable=False)
    Description = Column(Text)

    # Relationships
    ProjectMember = relationship("ProjectMember", back_populates="Role", cascade="all, delete-orphan")
    TeamMember = relationship("TeamMember", back_populates="Role", cascade="all, delete-orphan")

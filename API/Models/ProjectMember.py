import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from Db.session import Base


class ProjectMember(Base):
    __tablename__ = "ProjectMember"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False)
    UserId = Column(String(36), ForeignKey("User.Id", ondelete="CASCADE"), nullable=False)
    Role = Column(String(50))  # Simple string role like "Project Manager", "Developer", etc.
    JoinedAt = Column(DateTime, default=datetime.utcnow)
    IsDeleted = Column(Boolean, default=False)

    # Relationships
    Project = relationship("Project", back_populates="Members")
    User = relationship("User", back_populates="ProjectMemberships")
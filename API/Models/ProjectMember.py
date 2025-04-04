import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class ProjectMember(Base):
    __tablename__ = "ProjectMember"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False)
    UserId = Column(String(36), ForeignKey("User.Id", ondelete="CASCADE"), nullable=False)
    RoleId = Column(String(36), ForeignKey("Role.Id", ondelete="CASCADE"), nullable=False)
    JoinedAt = Column(DateTime, default=datetime.utcnow)

    # Relationships
    Project = relationship("Project", back_populates="ProjectMember")
    User = relationship("User", back_populates="ProjectMember")
    Role = relationship("Role", back_populates="ProjectMember")

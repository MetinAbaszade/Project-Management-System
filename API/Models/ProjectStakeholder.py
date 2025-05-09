import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class ProjectStakeholder(Base):
    __tablename__ = "ProjectStakeholder"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False)
    UserId = Column(String(36), ForeignKey("User.Id", ondelete="CASCADE"), nullable=False)
    Percentage = Column(Float, nullable=False, default=0)
    CreatedAt = Column(DateTime, default=datetime.now())
    UpdatedAt = Column(DateTime, onupdate=datetime.now())


    User = relationship("User", back_populates="ProjectStakes")
    Project = relationship("Project", back_populates="Stakeholders")
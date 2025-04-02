import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from db.session import Base


class Scope(Base):
    _tablename_ = "Scope"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False)
    Included = Column(Text, nullable=True)
    Excluded = Column(Text, nullable=True)
    StartDate = Column(DateTime)
    EndDate = Column(DateTime)
    CreatedAt = Column(DateTime, default=datetime.utcnow)

    # Relationship
    Project = relationship("Project", back_populates="Scope")
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class Scope(Base):
    __tablename__ = "Scope"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False)
    Included = Column(Text, nullable=True)  # What is included in the scope
    Excluded = Column(Text, nullable=True)  # What is excluded from the scope
    StartDate = Column(DateTime)
    EndDate = Column(DateTime)
    CreatedAt = Column(DateTime, default=datetime.utcnow)

    # Relationship
    Project = relationship("Project", back_populates="Scope")

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class Expense(Base):
    __tablename__ = "Expense"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False)
    Amount = Column(Integer, nullable=False)
    Description = Column(Text)
    DateIncurred = Column(DateTime, default=datetime.utcnow)

    # Relationships
    Project = relationship("Project", back_populates="Expense")

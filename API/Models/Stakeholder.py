import uuid
from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship
from Db.session import Base


class Stakeholder(Base):
    __tablename__ = "Stakeholder"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False)
    UserId = Column(String(36), ForeignKey("User.Id", ondelete="CASCADE"), nullable=False)
    Percentage = Column(Integer, nullable=False)

    # Relationships
    Project = relationship("Project", back_populates="Stakeholder")
    User = relationship("User")

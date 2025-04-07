import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship, validates
from Db.session import Base


class ProjectStakeholder(Base):
    __tablename__ = "ProjectStakeholder"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False)
    UserId = Column(String(36), ForeignKey("User.Id", ondelete="CASCADE"), nullable=False)
    Role = Column(String(100))
    Percentage = Column(Float, nullable=False, default=0)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, onupdate=datetime.utcnow)

    #
    __table_args__ = (
        CheckConstraint('Percentage >= 0 AND Percentage <= 100', name='valid_percentage_range'),
        {"sqlite_autoincrement": True},
    )

    # Relationships
    Project = relationship("Project", back_populates="Stakeholders")
    User = relationship("User", back_populates="ProjectStakes")

    # @validates('Percentage')
    # def validate_percentage(self, key, percentage):
    #
    #     if percentage < 0 or percentage > 100:
    #         raise ValueError("Percentage must be between 0 and 100")
    #     return percentage
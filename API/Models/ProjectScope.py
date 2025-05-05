import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class ProjectScope(Base):

    __tablename__ = "ProjectScope"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False, unique=True)
    IncludedItems = Column(Text)  # Newline-separated items
    ExcludedItems = Column(Text)  # Newline-separated items

    #schedule gelecek ucun yaradilsin ? yoxsa ele create oldugu vaxtdan baslasin?

    StartDate = Column(DateTime)
    EndDate = Column(DateTime)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, onupdate=datetime.utcnow)

    # Relationships
    Project = relationship("Project", back_populates="Scope")

    # @property
    # def IncludedItemsList(self):
    #     """Return included items as a list"""
    #     if not self.IncludedItems:
    #         return []
    #     return self.IncludedItems.split('\n')
    #
    # @property
    # def ExcludedItemsList(self):
    #     """Return excluded items as a list"""
    #     if not self.ExcludedItems:
    #         return []
    #     return self.ExcludedItems.split('\n')
    #
    # @property
    # def Duration(self):
    #     """Calculate project duration in days"""
    #     if not self.StartDate or not self.EndDate:
    #         return None
    #     return (self.EndDate - self.StartDate).days
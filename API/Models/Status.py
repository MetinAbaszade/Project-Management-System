import uuid
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from Db.session import Base


class Status(Base):

    __tablename__ = "Status"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Name = Column(String(50), nullable=False, unique=True)  # 'Not Started', 'In Progress', 'Completed'
    ColorHex = Column(String(7))  # Hex color code for UI display

    # Relationships
    Tasks = relationship("Task", back_populates="Status")

    # Predefined statuses
    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"

    # @classmethod
    # def get_status_color(cls, status_name):
    #     """Get appropriate color for status"""
    #     if status_name == cls.COMPLETED:
    #         return "#22C55E"  # Green
    #     elif status_name == cls.IN_PROGRESS:
    #         return "#3B82F6"  # Blue
    #     else:
    #         return "#9CA3AF"  # Gray
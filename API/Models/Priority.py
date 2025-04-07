import uuid
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from Db.session import Base


class Priority(Base):

    __tablename__ = "Priority"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Name = Column(String(50), nullable=False, unique=True)  # 'Low', 'Medium', 'High'
    ColorHex = Column(String(7))  # prioritiye gore rengi ferqli olsun

    # Relationships
    Tasks = relationship("Task", back_populates="Priority")

    # Predefined priorities
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

    # @classmethod
    # def get_priority_color(cls, priority_name):
    #     """Get appropriate color for priority level"""
    #     if priority_name == cls.HIGH:
    #         return "#EF4444"  # Red
    #     elif priority_name == cls.MEDIUM:
    #         return "#F59E0B"  # Yellow/Orange
    #     else:
    #         return "#22C55E"  # Green
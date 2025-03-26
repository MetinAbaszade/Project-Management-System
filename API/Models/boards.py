from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base
import enum
from datetime import datetime

class BoardType(enum.Enum):
    Kanban = "Kanban"
    Scrum = "Scrum"
    Custom = "Custom"

class Board(Base):
    __tablename__ = "boards"

    board_id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    name = Column(String(100), nullable=False)
    board_type = Column(Enum(BoardType), default=BoardType.Kanban)
    description = Column(Text)
    is_default = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", backref="boards", foreign_keys=[project_id])
    creator = relationship("User", foreign_keys=[created_by])

import uuid
from sqlalchemy import Column, String, Text, DateTime, Boolean, Enum, ForeignKey
from datetime import datetime
from Db.session import Base
import enum
from sqlalchemy.orm import relationship

class BoardTypeEnum(enum.Enum):
    Kanban = "Kanban"
    Scrum = "Scrum"
    Custom = "Custom"

class Board(Base):
    __tablename__ = "Boards"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Projects.Id"), nullable=False)
    Name = Column(String(100), nullable=False)
    BoardType = Column(Enum(BoardTypeEnum), default=BoardTypeEnum.Kanban)
    Description = Column(Text)
    IsDefault = Column(Boolean, default=False)
    CreatedBy = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    
    IsDeleted = Column(Boolean, default=False)

    Project = relationship("Project", backref="Boards", foreign_keys=[ProjectId])
    Creator = relationship("User", foreign_keys=[CreatedBy])

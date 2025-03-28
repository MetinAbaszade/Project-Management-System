import uuid
from sqlalchemy import Boolean, Column, String, Integer, Text, ForeignKey
from Db.session import Base
from datetime import datetime
from sqlalchemy.orm import relationship

class BoardColumn(Base):
    __tablename__ = "BoardColumns"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    BoardId = Column(String(36), ForeignKey("Boards.Id"), nullable=False)
    Name = Column(String(50), nullable=False)
    OrderIndex = Column(Integer, nullable=False)
    WipLimit = Column(Integer)
    TaskStatus = Column(String(20))
    Description = Column(Text)
    Color = Column(String(7))

    IsDeleted = Column(Boolean, default=False)

    Board = relationship("Board", backref="BoardColumns", foreign_keys=[BoardId])

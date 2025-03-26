from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base

class BoardColumn(Base):
    __tablename__ = "board_columns"

    column_id = Column(Integer, primary_key=True, autoincrement=True)
    board_id = Column(Integer, ForeignKey("boards.board_id"), nullable=False)
    name = Column(String(50), nullable=False)
    order_index = Column(Integer, nullable=False)
    wip_limit = Column(Integer)
    task_status = Column(String(20))
    description = Column(Text)
    color = Column(String(7))

    # Relationships
    board = relationship("Board", backref="columns", foreign_keys=[board_id])

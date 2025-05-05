import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship, validates
from Db.session import Base


class Expense(Base):

    __tablename__ = "Expense"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    TaskId = Column(String(36), ForeignKey("Task.Id", ondelete="CASCADE"), nullable=False)
    Amount = Column(Numeric(10, 2), nullable=False)
    Description = Column(Text)
    ExpenseDate = Column(DateTime, nullable=False)
    CreatedBy = Column(String(36), ForeignKey("User.Id"), nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)

    # Relationships
    Task = relationship("Task", back_populates="Expenses")
    User = relationship("User", foreign_keys=[CreatedBy])



    # @validates('Amount')
    # def validate_amount(self, key, amount):
    #     """Validate expense amount is positive"""
    #     if amount <= 0:
    #         raise ValueError("Expense amount must be positive")
    #     return amount
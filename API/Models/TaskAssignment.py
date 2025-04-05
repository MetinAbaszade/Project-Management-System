from sqlalchemy import Table, Column, String, ForeignKey
from Db.session import Base

TaskAssignment = Table(
    "TaskAssignment", Base.metadata,
    Column("TaskId", String(36), ForeignKey("Task.Id", ondelete="CASCADE"), primary_key=True),
    Column("UserId", String(36), ForeignKey("User.Id", ondelete="CASCADE"), primary_key=True)
)

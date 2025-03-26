from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from Db.session import Base
from datetime import datetime

class Label(Base):
    __tablename__ = "labels"

    label_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    color = Column(String(7))
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('name', 'project_id', name='unique_label_project'),
    )

    # Relationships
    project = relationship("Project", backref="labels")
    creator = relationship("User", backref="created_labels", foreign_keys=[created_by])

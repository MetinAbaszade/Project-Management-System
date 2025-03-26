from sqlalchemy import Column, Integer, String, DateTime, Float, DECIMAL, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from Db.session import Base
from datetime import datetime

class ProjectMember(Base):
    __tablename__ = "project_members"

    project_member_id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    role_in_project = Column(String(50))
    member_type = Column(String(50), nullable=False, default="Collaborator")  # Owner or Collaborator
    total_hours_worked = Column(Float, default=0)
    hourly_rate = Column(DECIMAL(10, 2))
    joined_at = Column(DateTime, default=datetime.utcnow)
    invited_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)

    __table_args__ = (
        UniqueConstraint('project_id', 'user_id', name='unique_project_user'),
    )

    # Relationships
    project = relationship("Project", backref="project_members", foreign_keys=[project_id])
    user = relationship("User", backref="project_memberships", foreign_keys=[user_id])
    inviter = relationship("User", foreign_keys=[invited_by])

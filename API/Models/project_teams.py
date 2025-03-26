from sqlalchemy import Column, Integer, DateTime, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.orm import relationship
from Db.session import Base
from datetime import datetime

class ProjectTeam(Base):
    __tablename__ = "project_teams"

    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.team_id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    assigned_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)

    __table_args__ = (
        PrimaryKeyConstraint('project_id', 'team_id'),
    )

    # Relationships
    project = relationship("Project", backref="project_teams", foreign_keys=[project_id])
    team = relationship("Team", backref="project_teams", foreign_keys=[team_id])
    assigner = relationship("User", foreign_keys=[assigned_by])

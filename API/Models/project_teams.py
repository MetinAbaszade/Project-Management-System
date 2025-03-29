import uuid
from sqlalchemy import Boolean, Column, String, DateTime, ForeignKey, PrimaryKeyConstraint
from datetime import datetime
from Db.session import Base
from sqlalchemy.orm import relationship

class ProjectTeam(Base):
    __tablename__ = "ProjectTeams"
    ProjectId = Column(String(36), ForeignKey("Projects.Id"), nullable=False)
    TeamId = Column(String(36), ForeignKey("Teams.Id"), nullable=False)
    AssignedAt = Column(DateTime, default=datetime.utcnow)
    AssignedBy = Column(String(36), ForeignKey("Users.Id"), nullable=True)

    
    IsDeleted = Column(Boolean, default=False)
    
    __table_args__ = (
        PrimaryKeyConstraint('ProjectId', 'TeamId'),
    )
    Project = relationship("Project", backref="ProjectTeams", foreign_keys=[ProjectId])
    Team = relationship("Team", backref="ProjectTeams", foreign_keys=[TeamId])
    Assigner = relationship("User", foreign_keys=[AssignedBy])

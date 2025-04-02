import uuid
from sqlalchemy import Boolean, Column, String, DateTime, ForeignKey, PrimaryKeyConstraint
from datetime import datetime
from Db.session import Base
from sqlalchemy.orm import relationship

class ProjectTeam(Base):
    __tablename__ = "ProjectTeam"
    ProjectId = Column(String(36), ForeignKey("Project.Id"), nullable=False)
    TeamId = Column(String(36), ForeignKey("Team.Id"), nullable=False)
    AssignedAt = Column(DateTime, default=datetime.utcnow)
    AssignedBy = Column(String(36), ForeignKey("User.Id"), nullable=True)

    
    IsDeleted = Column(Boolean, default=False)
    
    __table_args__ = (
        PrimaryKeyConstraint('ProjectId', 'TeamId'),
    )
    Project = relationship("Project", backref="ProjectTeam", foreign_keys=[ProjectId])
    Team = relationship("Team", backref="ProjectTeam", foreign_keys=[TeamId])
    Assigner = relationship("User", foreign_keys=[AssignedBy])

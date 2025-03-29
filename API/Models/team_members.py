import uuid
from sqlalchemy import Boolean, Column, String, DateTime, ForeignKey, PrimaryKeyConstraint
from datetime import datetime
from Db.session import Base
from sqlalchemy.orm import relationship

class TeamMember(Base):
    __tablename__ = "TeamMembers"
    TeamId = Column(String(36), ForeignKey("Teams.Id"), nullable=False)
    UserId = Column(String(36), ForeignKey("Users.Id"), nullable=False)
    Role = Column(String(50))
    JoinedAt = Column(DateTime, default=datetime.utcnow)
    InvitedBy = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    
    IsDeleted = Column(Boolean, default=False)
    
    __table_args__ = (
        PrimaryKeyConstraint('TeamId', 'UserId'),
    )
    Team = relationship("Team", backref="TeamMembers", foreign_keys=[TeamId])
    User = relationship("User", foreign_keys=[UserId])
    Inviter = relationship("User", foreign_keys=[InvitedBy])

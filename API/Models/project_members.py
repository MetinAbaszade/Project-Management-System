import enum
import uuid
from sqlalchemy import Boolean, Column, String, Float, DECIMAL, DateTime, ForeignKey, Enum, PrimaryKeyConstraint
from datetime import datetime
from Db.session import Base
from sqlalchemy.orm import relationship

# We use a simple Enum for MemberType
class MemberTypeEnum(enum.Enum):
    Owner = "Owner"
    Collaborator = "Collaborator"

class ProjectMember(Base):
    __tablename__ = "ProjectMembers"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Projects.Id"), nullable=False)
    UserId = Column(String(36), ForeignKey("Users.Id"), nullable=False)
    RoleInProject = Column(String(50))
    MemberType = Column(Enum(MemberTypeEnum), default=MemberTypeEnum.Collaborator)
    TotalHoursWorked = Column(Float, default=0)
    HourlyRate = Column(DECIMAL(10,2))
    JoinedAt = Column(DateTime, default=datetime.utcnow)
    InvitedBy = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    
    
    IsDeleted = Column(Boolean, default=False)
    
    __table_args__ = (
        # lazim olsa sonraki lineni uncomment edersiz 
        # UniqueConstraint('ProjectId', 'UserId', name='UniqueProjectUser'),
    )
    Project = relationship("Project", backref="ProjectMembers", foreign_keys=[ProjectId])
    User = relationship("User", backref="ProjectMemberships", foreign_keys=[UserId])
    Inviter = relationship("User", foreign_keys=[InvitedBy])

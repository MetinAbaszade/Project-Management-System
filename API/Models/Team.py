import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from Db.session import Base


class Team(Base):

    __tablename__ = "Team"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Name = Column(String(100), nullable=False)
    Description = Column(Text)
    ColorIndex = Column(Integer, default=0) #frontend ucun
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, onupdate=datetime.utcnow)
    CreatedBy = Column(String(36), ForeignKey("User.Id"), nullable=False)
    IsDeleted = Column(Boolean, default=False)

    # Relationships
    Tasks = relationship("Task", back_populates="Team")
    Members = relationship("User", secondary="TeamMember", back_populates="Teams")
    TeamProjects = relationship("TeamProject", back_populates="Team", cascade="all, delete-orphan")
    Projects = relationship("Project", secondary="TeamProject", viewonly=True)
    TeamMemberships = relationship("TeamMember", back_populates="Team", cascade="all, delete-orphan")
    Creator = relationship("User", foreign_keys=[CreatedBy], back_populates="TeamsCreated")

    # @property
    # def MemberCount(self):
    #     """Get number of members in this team"""
    #     return len(self.Members)
    #
    # @property
    # def LeadMember(self):
    #     """Get the team leader (if assigned)"""
    #     for membership in self.TeamMemberships:
    #         if membership.IsLeader:
    #             return membership.User
    #     return None
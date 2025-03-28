import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from datetime import datetime
from Db.session import Base
from sqlalchemy.orm import relationship

class Label(Base):
    __tablename__ = "Labels"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Name = Column(String(50), nullable=False)
    Color = Column(String(7))
    ProjectId = Column(String(36), ForeignKey("Projects.Id"), nullable=True)
    CreatedBy = Column(String(36), ForeignKey("Users.Id"), nullable=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (
        # Unique constraint on (Name, ProjectId)


        
        #lazim olsa bu lineni uncomment edin 
        # UniqueConstraint('Name', 'ProjectId', name='UniqueLabelProject'),
    )
   
    # Relationships
    Project = relationship("Project", backref="Labels")
    Creator = relationship("User", backref="CreatedLabels", foreign_keys=[CreatedBy])

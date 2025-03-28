import uuid
from sqlalchemy import Column, String, Float, Text, ForeignKey, PrimaryKeyConstraint
from Db.session import Base
from datetime import datetime
from sqlalchemy.orm import relationship

class ProjectLanguage(Base):
    __tablename__ = "ProjectLanguages"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Projects.Id"), nullable=False)
    LanguageId = Column(String(36), ForeignKey("Languages.Id"), nullable=False)
    UsagePercentage = Column(Float, default=0)
    Notes = Column(Text)
    __table_args__ = (
        # lazim olsa uncomment edin 

        # UniqueConstraint('ProjectId', 'LanguageId', name='UniqueProjLang'),
    )
    Project = relationship("Project", backref="ProjectLanguages", foreign_keys=[ProjectId])
    Language = relationship("Language", backref="ProjectLanguages", foreign_keys=[LanguageId])

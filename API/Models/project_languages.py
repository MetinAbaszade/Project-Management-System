from sqlalchemy import Column, Integer, Float, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from Db.session import Base

class ProjectLanguage(Base):
    __tablename__ = "project_languages"

    project_language_id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    language_id = Column(Integer, ForeignKey("languages.language_id"), nullable=False)
    usage_percentage = Column(Float, default=0)
    notes = Column(Text)

    __table_args__ = (
        UniqueConstraint('project_id', 'language_id', name='unique_proj_lang'),
    )

    # Relationships
    project = relationship("Project", backref="project_languages", foreign_keys=[project_id])
    language = relationship("Language", backref="project_languages", foreign_keys=[language_id])

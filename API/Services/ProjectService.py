from Repositories import ProjectRepository
from Schemas.ProjectSchema import ProjectCreate, ProjectMemberCreate
from sqlalchemy.orm import Session
from Dependencies.db import get_db
from fastapi import Depends


class ProjectService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create_project(self, project_data: ProjectCreate, owner_id: int):
        return ProjectRepository.create_project(self.db, project_data, owner_id)
    
    def get_user_projects(self, db: Session, user_id: int):
        return ProjectRepository.get_projects_by_user(db, user_id)

    def add_project_member(self, project_id: int, member_data: ProjectMemberCreate):
        return ProjectRepository.add_member_to_project(self.db, project_id, member_data)



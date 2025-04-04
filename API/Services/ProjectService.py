from Repositories import ProjectRepository
from Schemas.ProjectSchema import ProjectCreate, ProjectMemberCreate
from sqlalchemy.orm import Session
from Dependencies.db import GetDb
from fastapi import Depends
from uuid import UUID


class ProjectService:
    def __init__(self, db: Session = Depends(GetDb)):
        self.db = db

    def CreateProject(self, projectData: ProjectCreate, ownerId: UUID):
        return ProjectRepository.CreateProject(self.db, projectData, ownerId)
    
    def GetUserProjects(self, db: Session, userId: UUID):
        return ProjectRepository.GetProjectsByUser(db, userId)

    def AddProjectMember(self, projectId: UUID, memberData: ProjectMemberCreate):
        return ProjectRepository.AddMemberToProject(self.db, projectId, memberData)
    
    def SoftDeleteProject(self, projectId: UUID, userId: UUID):
        return ProjectRepository.SoftDeleteProject(self.db, projectId, userId)
    
    def SoftDeleteProjectMember(self, projectId: UUID, memberId: UUID):
        return ProjectRepository.SoftDeleteProjectMember(self.db, projectId, memberId)






from typing import Optional, List

from Models import Project, Task
from Repositories import ProjectRepository
from Schemas.ProjectSchema import ProjectCreate, ProjectUpdate
from sqlalchemy.orm import Session
from Dependencies.db import GetDb
from fastapi import Depends, HTTPException
from uuid import UUID

from Services.UserService import UserService


class ProjectService:
    def __init__(self, db: Session = Depends(GetDb), userService: UserService = Depends()):
        self.db = db
        self.userService = userService

    def CreateProject(self, ownerId: UUID, projectData: ProjectCreate):
        return ProjectRepository.CreateProject(self.db, projectData, ownerId)
    
    def UpdateProject (self, updateData: ProjectUpdate):
        project = self.db.query(Project).filter(Project.Id == updateData.ProjectId, Project.IsDeleted == False).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found.")
        return ProjectRepository.UpdateProject (self.db, project, updateData)

    def GetProjectById(self, projectId: UUID) -> Optional[Project]:
        return ProjectRepository.GetProjectById(self.db, projectId)

    def SoftDeleteProject(self, userId: UUID, projectId: UUID):
        project = self.db.query(Project).filter(
            Project.Id == str(projectId),
            Project.IsDeleted == False
        ).first()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        if str(project.OwnerId) != str(userId):
            raise HTTPException(status_code=403, detail="Only the project owner can delete the project.")

        return ProjectRepository.SoftDeleteProject(self.db, userId, project)

    def AddProjectMember(self, userId: UUID, projectId: UUID, memberId: UUID):
        if not ProjectRepository.IsProjectOwner(self.db, userId, projectId):
            raise HTTPException(status_code=403, detail="Only the project owner can add members.")
        member_user = self.userService.GetUserById(memberId)
        if not member_user:
            raise HTTPException(status_code=404, detail="User to be added not found")
        return ProjectRepository.AddMemberToProject(self.db, projectId, memberId)

    def SoftDeleteProjectMember(self, projectId: UUID, memberId: UUID):
        return ProjectRepository.SoftDeleteProjectMember(self.db, projectId, memberId)

    def GetProjectOwner(self, projectId: UUID):
        return ProjectRepository.GetProjectOwner(self.db, projectId)

    def IsProjectOwner(self, userId: UUID, projectId: UUID):
        return ProjectRepository.IsProjectOwner(self.db, userId, projectId)

    def IsProjectMember(self, userId: UUID, projectId: UUID):
        return ProjectRepository.IsProjectMember(self.db, userId, projectId)

    def GetProjectMembers(self, projectId: UUID):
        project = self.db.query(Project).filter(
            Project.Id == str(projectId),
            Project.IsDeleted == False
        ).first()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        return ProjectRepository.GetProjectMembers(self.db, projectId)

    def GetProjectTeams(self, projectId: UUID):
        project = self.db.query(Project).filter(
            Project.Id == str(projectId),
            Project.IsDeleted == False
        ).first()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        return ProjectRepository.GetProjectTeams(self.db, projectId)

    def GetProjectTasks(self, projectId: UUID):
        if not self.GetProjectById(projectId):
            raise HTTPException(status_code=404, detail="Project not found")
        return ProjectRepository.GetTasks(projectId)

    def GetProjectTasks(self, projectId: UUID) -> List[Task]:
        if not self.GetProjectById(projectId):
            raise HTTPException(status_code=404, detail="Project not found")
        return ProjectRepository.GetTasks(self.db, projectId)

def UpdateProject(self, userId: UUID, projectId: UUID, projectData: 'ProjectUpdate'):
    """
    Update an existing project. Only the project owner can update a project.
    """
    project = self.db.query(Project).filter(
        Project.Id == str(projectId),
        Project.IsDeleted == False
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if str(project.OwnerId) != str(userId):
        raise HTTPException(status_code=403, detail="Only the project owner can update the project")

    updateData = projectData.dict(exclude_unset=True)
    return ProjectRepository.UpdateProject(self.db, projectId, updateData)





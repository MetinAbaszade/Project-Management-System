from Models import Project
from Repositories import ProjectRepository
from Schemas.ProjectSchema import ProjectCreate
from sqlalchemy.orm import Session
from Dependencies.db import GetDb
from fastapi import Depends, HTTPException
from uuid import UUID


class ProjectService:
    def __init__(self, db: Session = Depends(GetDb)):
        self.db = db

    def CreateProject(self, ownerId: UUID, projectData: ProjectCreate):
        return ProjectRepository.CreateProject(self.db, projectData, ownerId)

    def SoftDeleteProject(self, userId: UUID, projectId: UUID):
        # Step 1: Check if project exists
        project = self.db.query(Project).filter(
            Project.Id == str(projectId),
            Project.IsDeleted == False
        ).first()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Step 2: Check if the user is the owner
        if str(project.CreatedBy) != str(userId):
            raise HTTPException(status_code=403, detail="Only the project owner can delete the project.")

        # Step 3: Proceed with soft deletion
        return ProjectRepository.SoftDeleteProject(self.db, projectId, userId)

    def AddProjectMember(self, userId: UUID, projectId: UUID, memberId: UUID):
        if not ProjectRepository.IsProjectOwner(self.db, userId, projectId):
            raise HTTPException(status_code=403, detail="Only the project owner can add members.")
        return ProjectRepository.AddMemberToProject(self.db, projectId, memberId)

    def SoftDeleteProjectMember(self, projectId: UUID, memberId: UUID):
        return ProjectRepository.SoftDeleteProjectMember(self.db, projectId, memberId)

    def GetProjectOwner(self, projectId: UUID):
        return ProjectRepository.GetProjectOwner(self.db, projectId)

    def IsProjectOwner(self, userId: UUID, projectId: UUID):
        return ProjectRepository.IsProjectOwner(self.db, userId, projectId)

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






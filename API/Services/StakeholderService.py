# Services/StakeholderService.py
from fastapi import Depends, HTTPException
from Dependencies.db import GetDb
from sqlalchemy.orm import Session
from uuid import UUID
from Repositories.StakeholderRepository import StakeholderRepository
from Schemas.StakeholderSchema import StakeholderCreate, StakeholderUpdate
from Services.ProjectService import ProjectService
from Services.UserService import UserService


class StakeholderService:
    def __init__(self,
                 db: Session = Depends(GetDb),
                 userService: UserService = Depends(),
                 projectService: ProjectService = Depends()):
        self.repo = StakeholderRepository(db)
        self.userService = userService
        self.projectService = projectService


    def GetAllByProject(self, projectId: UUID):
        return self.repo.GetByProjectId(projectId)

    def GetById(self, stakeholder_id: UUID):
        stakeholder = self.repo.GetById(stakeholder_id)
        if not stakeholder:
            raise HTTPException(status_code=404, detail="Stakeholder not found")
        return stakeholder

    def Create(self, userId: UUID, data: StakeholderCreate):
        # Check if project exists
        project = self.projectService.GetProjectById(data.ProjectId)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # ✅ Ensure current user is the project owner
        if str(project.OwnerId) != str(userId):
            raise HTTPException(status_code=403, detail="Only the project owner can add stakeholders")

        # ✅ Ensure current user is the project owner
        if str(userId) == str(data.UserId):
            raise HTTPException(status_code=403, detail="Project owner can not be stakeholder")

        # Check if the user to be added exists
        if not self.userService.UserExistsById(data.UserId):
            raise HTTPException(status_code=404, detail="Stakeholder user not found")

        return self.repo.Create(data)

    def Update(self, userId: UUID, stakeholderId: UUID, data: StakeholderUpdate):
        stakeholder = self.repo.GetById(stakeholderId)
        if not stakeholder:
            raise HTTPException(status_code=404, detail="Stakeholder not found")

        project = stakeholder.Project
        if str(project.OwnerId) != str(userId):
            raise HTTPException(status_code=403, detail="Only the project owner can update stakeholders")

        return self.repo.Update(stakeholderId, data)

    def Delete(self, userId: UUID, stakeholderId: UUID):
        stakeholder = self.repo.GetById(stakeholderId)
        if not stakeholder:
            raise HTTPException(status_code=404, detail="Stakeholder not found")

        project = stakeholder.Project
        if str(project.OwnerId) != str(userId):
            raise HTTPException(status_code=403, detail="Only the project owner can delete stakeholders")

        return self.repo.Delete(stakeholderId)


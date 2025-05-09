# Repositories/StakeholderRepository.py
from typing import Optional

from sqlalchemy.orm import Session
from Models.ProjectStakeholder import ProjectStakeholder
from Schemas.StakeholderSchema import StakeholderCreate, StakeholderUpdate
from uuid import UUID
from datetime import datetime

class StakeholderRepository:
    def __init__(self, db: Session):
        self.db = db

    def GetById(self, stakeholderId: UUID) -> Optional[ProjectStakeholder]:
        return self.db.query(ProjectStakeholder).filter(ProjectStakeholder.Id == str(stakeholderId)).first()

    def GetByProjectId(self, projectId: UUID):
        return self.db.query(ProjectStakeholder).filter(ProjectStakeholder.ProjectId == str(projectId)).all()

    def Create(self, data: StakeholderCreate):
        stakeholder = ProjectStakeholder(
            ProjectId=str(data.ProjectId),
            UserId=str(data.UserId),
            Percentage=data.Percentage
        )
        self.db.add(stakeholder)
        self.db.commit()
        self.db.refresh(stakeholder)
        return stakeholder

    def Update(self, stakeholderId: UUID, data: StakeholderUpdate):
        stakeholder = self.GetById(stakeholderId)
        for key, value in data.dict(exclude_unset=True).items():
            setattr(stakeholder, key, value)
        stakeholder.UpdatedAt = datetime.now()
        self.db.commit()
        self.db.refresh(stakeholder)
        return stakeholder

    def Delete(self, stakeholderId: UUID):
        stakeholder = self.GetById(stakeholderId)
        self.db.delete(stakeholder)
        self.db.commit()
        return {"message": "Stakeholder deleted successfully"}


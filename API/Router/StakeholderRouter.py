# Router/StakeholderRouter.py
from fastapi import APIRouter, Depends
from typing import List
from uuid import UUID

from Dependencies.auth import GetCurrentUser
from Models import User
from Schemas.StakeholderSchema import StakeholderCreate, StakeholderUpdate, StakeholderResponse
from Services.StakeholderService import StakeholderService

router = APIRouter(prefix="/stakeholders", tags=["Stakeholders"])

@router.get("/project/{projectId}", response_model=List[StakeholderResponse])
def GetProjectStakeholders(projectId: UUID,
                           currentUser: User = Depends(GetCurrentUser),
                           service: StakeholderService = Depends()):
    return service.GetAllByProject(projectId)

@router.get("/{stakeholderId}", response_model=StakeholderResponse)
def GetStakeholder(stakeholderId: UUID,
                   currentUser: User = Depends(GetCurrentUser),
                   service: StakeholderService = Depends()):
    return service.GetById(stakeholderId)

@router.post("/", response_model=StakeholderResponse)
def CreateStakeholder(data: StakeholderCreate,
                      currentUser: User = Depends(GetCurrentUser),
                      service: StakeholderService = Depends()):
    return service.Create(currentUser.Id, data)

@router.put("/{stakeholderId}", response_model=StakeholderResponse)
def UpdateStakeholder(stakeholderId: UUID,
                      data: StakeholderUpdate,
                      currentUser: User = Depends(GetCurrentUser),
                      service: StakeholderService = Depends()):
    return service.Update(currentUser.Id, stakeholderId, data)

@router.delete("/{stakeholderId}")
def DeleteStakeholder(stakeholderId: UUID,
                      currentUser: User = Depends(GetCurrentUser),
                      service: StakeholderService = Depends()):
    return service.Delete(currentUser.Id, stakeholderId)

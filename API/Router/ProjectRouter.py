from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List 
from uuid import UUID

from Schemas.ProjectSchema import ProjectCreate, ProjectOut, ProjectMemberCreate
from Services.ProjectService import ProjectService
from Dependencies.db import GetDb
from Dependencies.auth import GetCurrentUser
from Models.User import User

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/create-project", response_model=ProjectOut)
def create_project(
    projectData: ProjectCreate,
    currentUser: User = Depends(GetCurrentUser),
    projectService: ProjectService = Depends(ProjectService)
):
    return projectService.CreateProject(projectData, currentUser.Id)

@router.get("/my-projects", response_model=List[ProjectOut])
def GetMyProjects(
    db: Session = Depends(GetDb),
    currentUser: User = Depends(GetCurrentUser),
    projectService: ProjectService = Depends(ProjectService)
):
    return projectService.GetUserProjects(db, currentUser.Id)


@router.post("/{project_id}/add-member", status_code=status.HTTP_201_CREATED)
def AddMember(
    projectId: UUID,
    memberData: ProjectMemberCreate,
    projectService: ProjectService = Depends(ProjectService)
):
    return projectService.AddProjectMember(projectId, memberData)

@router.delete("/{projectId}/delete", status_code=status.HTTP_200_OK)
def deleteProject(
    projectId: UUID,
    currentUser: User = Depends(GetCurrentUser),
    projectService: ProjectService = Depends(ProjectService)
):
    return projectService.SoftDeleteProject(projectId, currentUser.Id)

@router.delete("/{projectId}/remove-member/{memberId}", status_code=status.HTTP_200_OK)
def removeMemberFromProject(
    projectId: UUID,
    memberId: UUID,
    # currentUser: User = Depends(GetCurrentUser),
    projectService: ProjectService = Depends(ProjectService)
):
    return projectService.SoftDeleteProjectMember(projectId, memberId)
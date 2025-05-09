from typing import List

from fastapi import APIRouter, Depends, status
from uuid import UUID

from Models import User
from Schemas.ProjectSchema import ProjectCreate, ProjectOut
from Schemas.TaskSchema import TaskResponse
from Services.ProjectService import ProjectService
from Dependencies.auth import GetCurrentUser

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/create", response_model=ProjectOut)
def CreateProject(
    projectData: ProjectCreate,
    currentUser: User = Depends(GetCurrentUser),
    projectService: ProjectService = Depends(ProjectService)
):
    return projectService.CreateProject(currentUser.Id, projectData)

@router.delete("/{projectId}/delete", status_code=status.HTTP_200_OK)
def DeleteProject(
    projectId: UUID,
    currentUser: User = Depends(GetCurrentUser),
    projectService: ProjectService = Depends(ProjectService)
):
    return projectService.SoftDeleteProject(currentUser.Id, projectId)

@router.get("/{projectId}", response_model=ProjectOut, summary="Get a project by ID")
def GetProjectById(
    projectId: UUID,
    currentUser: User = Depends(GetCurrentUser),
    projectService: ProjectService = Depends(ProjectService)
):
    return projectService.GetProjectById(projectId)

@router.post("/{project_id}/add-member", status_code=status.HTTP_201_CREATED)
def AddMember(
    projectId: UUID,
    memberId: UUID,
    currentUser: User = Depends(GetCurrentUser),
    projectService: ProjectService = Depends(ProjectService)):
    return projectService.AddProjectMember(currentUser.Id, projectId, memberId)

@router.delete("/{projectId}/remove-member/{memberId}", status_code=status.HTTP_200_OK)
def RemoveMember(
    projectId: UUID,
    memberId: UUID,
    currentUser: User = Depends(GetCurrentUser),
    projectService: ProjectService = Depends(ProjectService)
):
    return projectService.SoftDeleteProjectMember(projectId, memberId)

@router.get("/{projectId}/members", summary="Get all active project members")
def GetProjectMembers(
    projectId: UUID,
    currentUser: User = Depends(GetCurrentUser),
    projectService: ProjectService = Depends(ProjectService)
):
    return projectService.GetProjectMembers(projectId)


@router.get("/{projectId}/teams", summary="Get all active project teams")
def GetProjectTeams(
    projectId: UUID,
    currentUser: User = Depends(GetCurrentUser),
    projectService: ProjectService = Depends(ProjectService)
):
    return projectService.GetProjectTeams(projectId)

@router.get("/{projectId}/tasks", response_model=List[TaskResponse], summary="Get all tasks of a project")
def GetProjectTasks(
    projectId: UUID,
    currentUser: User = Depends(GetCurrentUser),
    service: ProjectService = Depends()
):
    return service.GetProjectTasks(projectId)


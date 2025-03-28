from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List  # ✅ FIXED

from Schemas.ProjectSchema import ProjectCreate, ProjectOut, ProjectMemberCreate
from Services.ProjectService import ProjectService
from Dependencies.db import get_db  # ✅ RE-ENABLED
from Dependencies.auth import get_current_user
from Models.Users import User

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/create-project", response_model=ProjectOut)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),  # ✅ RE-ADDED
    current_user: User = Depends(get_current_user),
    project_service: ProjectService = Depends(ProjectService)
):
    return project_service.create_project(project_data, current_user.id)

@router.get("/my-projects", response_model=List[ProjectOut])
def get_my_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    project_service: ProjectService = Depends(ProjectService)
):
    return project_service.get_user_projects(db, current_user.id)


@router.post("/{project_id}/add-member", status_code=status.HTTP_201_CREATED)
def add_member(
    project_id: int,
    member_data: ProjectMemberCreate,
    current_user: User = Depends(get_current_user),
    project_service: ProjectService = Depends(ProjectService)
):
    return project_service.add_project_member(project_id, member_data)



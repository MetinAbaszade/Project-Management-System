from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.orm import Session
from uuid import UUID
from Dependencies.db import GetDb
from Dependencies.auth import GetCurrentUser
from Models import User
from Services.UserService import UserService
from Schemas.UserSchema import UpdatePasswordSchema, UserResponseSchema

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/{userId}/projects", summary="Get all projects of the user")
def GetUserProjects(
    userId: UUID,
    userService: UserService = Depends(),):
    return userService.GetUserProjects(userId)

@router.get("/{userId}/teams", summary="Get all teams of the user")
def GetUserTeams(
    userId: UUID,
    userService: UserService = Depends()):
    return userService.GetUserTeams(userId)

@router.get("/projects", summary="Get all projects of the current user")
def GetUserProjects(
    currentUser: User = Depends(GetCurrentUser),
    userService: UserService = Depends()):
    return userService.GetUserProjects(currentUser.Id)

@router.get("/teams", summary="Get all teams of the current user")
def GetUserTeams(
    currentUser: User = Depends(GetCurrentUser),
    userService: UserService = Depends()):
    return userService.GetUserTeams(currentUser.Id)

@router.get("/{userId}/tasks/assigned", summary="Get all tasks assigned to the user")
def GetAssignedTasks(userId: UUID, userService: UserService = Depends()):
    return userService.GetUserAssignedTasks(userId)

@router.get("/{userId}/tasks/created", summary="Get all tasks created by the user")
def GetCreatedTasks(userId: UUID, userService: UserService = Depends()):
    return userService.GetUserCreatedTasks(userId)

@router.get("/tasks/assigned", summary="Get all tasks assigned to current user")
def GetAssignedTasksCurrent(currentUser: User = Depends(GetCurrentUser), userService: UserService = Depends()):
    return userService.GetUserAssignedTasks(currentUser.Id)

@router.get("/tasks/created", summary="Get all tasks created by current user")
def GetCreatedTasksCurrent(currentUser: User = Depends(GetCurrentUser), userService: UserService = Depends()):
    return userService.GetUserCreatedTasks(currentUser.Id)

@router.post("/reset-password", summary="Change the forgetten password")
def ResetPassword(request: UpdatePasswordSchema, userService: UserService = Depends()):
    return userService.UpdatePassword(request.Email, request.NewPassword)

@router.get("/get-user", response_model=UserResponseSchema)
def GetCurrentUserData(
    db: Session = Depends(GetDb),
    currentUser: str = Depends(GetCurrentUser)
):
    return UserService.GetCurrentUserData(db, currentUser)

@router.post("/upload/profile-picture", status_code=status.HTTP_201_CREATED)
def UploadProfilePicture(
    file: UploadFile = File(...),
    db: Session = Depends(GetDb),
    currentUser: str = Depends(GetCurrentUser)
):
    return UserService.UploadProfilePicture(
        db=db,
        file=file,
        currentUserId=currentUser.Id
    )
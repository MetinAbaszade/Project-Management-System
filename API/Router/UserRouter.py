from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID

from Services.TeamService import TeamService
from Services.UserService import UserService

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

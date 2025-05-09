from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path
from typing import List

from Dependencies.auth import GetCurrentUser
from Models import User
from Schemas.TeamSchema import TeamCreate, TeamResponse, TeamUpdate, AddTeamMember, RemoveTeamMember
from Services.TeamService import TeamService

router = APIRouter(
    prefix="/teams",
    tags=["Teams"],
    responses={404: {"description": "Not found"}}
)

@router.post("/", response_model=TeamResponse, summary="Create a new team")
def CreateTeam(teamData: TeamCreate,
                currentUser: User = Depends(GetCurrentUser),
                service: TeamService = Depends()):
    return service.AddTeam(currentUser.Id, teamData.ProjectId, teamData)

@router.get("/", response_model=List[TeamResponse], summary="Get all teams")
def ListTeams(currentUser: User = Depends(GetCurrentUser), service: TeamService = Depends()):
    return service.GetAllTeams()

@router.get("/{team_id}", response_model=TeamResponse, summary="Get a specific team")
def GetTeam(teamId: UUID,
            service: TeamService = Depends(),
            currentUser: User = Depends(GetCurrentUser)):
    team = service.GetTeamById(teamId)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@router.put("/{teamId}", response_model=TeamResponse, summary="Update a team")
def UpdateTeam(teamId: UUID,
                teamData: TeamUpdate,
                currentUser: User = Depends(GetCurrentUser),
                service: TeamService = Depends()):
    return service.UpdateTeam(currentUser.Id, teamId, teamData)

@router.delete("/{team_id}", status_code=204, summary="Soft delete a team")
def DeleteTeam(teamId: UUID,
                currentUser: User = Depends(GetCurrentUser),
                service: TeamService = Depends()):
    success = service.RemoveTeam(currentUser.Id, teamId)
    if not success:
        raise HTTPException(status_code=404, detail="Team not found")

@router.post("/members", summary="Add a member to a team")
def AddTeamMember(
    addTeamMemberSchema: AddTeamMember,
    currentUser: User = Depends(GetCurrentUser),
    service: TeamService = Depends()
):
    return service.AddMember(currentUser.Id, addTeamMemberSchema)

@router.delete("/{team_id}/members/{user_id}", summary="Remove a member from a team")
def RemoveTeamMember(
    removeTeamMemberSchema: RemoveTeamMember,
    currentUser: User = Depends(GetCurrentUser),
    service: TeamService = Depends()
):
    return service.RemoveMember(currentUser.Id,
                                removeTeamMemberSchema.TeamId,
                                removeTeamMemberSchema.UserIdToBeRemoved)

@router.get("/{team_id}/tasks", summary="Get all tasks for a team")
def GetTeamTasks(
    teamId: UUID,
    currentUser: User = Depends(GetCurrentUser),
    service: TeamService = Depends()
):
    return service.GetTeamTasks(teamId)
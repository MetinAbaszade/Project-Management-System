from typing import Optional

from fastapi import Depends, HTTPException

from Models import TeamMember, Team
from Repositories.TeamRepository import TeamRepository
import Repositories.ProjectRepository as ProjectRepository
from Schemas.TeamSchema import TeamCreate, TeamUpdate, AddTeamMember
from sqlalchemy.orm import Session
from Dependencies.db import GetDb
from uuid import UUID
from Services.UserService import UserService


class TeamService:
    def __init__(
        self,
        teamRepository: TeamRepository = Depends(),
        db: Session = Depends(GetDb)
    ):
        self.db = db
        self.repo = teamRepository
        self.userService = UserService(db)

    def AddTeam(self, userId: UUID, projectId: UUID, teamData: TeamCreate):
        if not ProjectRepository.IsProjectOwner(self.db, userId, projectId):
            raise HTTPException(status_code=403, detail="Only the project owner can add a team.")

        # Step 1: Create the team
        createdTeam = self.repo.Create(userId, teamData)

        # Step 2: Add creator to the team as leader
        member = TeamMember(
            TeamId=str(createdTeam.Id),
            UserId=str(userId),
            Role="Leader",
            IsLeader=True
        )
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)

        return createdTeam

    def GetAllTeams(self):
        return self.repo.GetAll()

    def GetTeamById(self, teamId: UUID) -> Optional[Team]:
        return self.repo.GetById(teamId)

    def UpdateTeam(self, userId: UUID, teamId: UUID, teamData: TeamUpdate):
        team = self.GetTeamById(teamId)
        if not team:
            raise HTTPException(status_code=403, detail="Team Not Found. Please check the team id and try again.")
        if not team.CreatedBy == userId:
            raise HTTPException(status_code=403, detail="Only the creator of team can update the team.")
        return self.repo.Update(teamId, teamData)

    def RemoveTeam(self, userId: UUID, teamId: UUID):
        team = self.GetTeamById(teamId)
        if not team:
            return None
        if not team.CreatedBy == userId:
            raise HTTPException(status_code=403, detail="Only the creator of team can remove the team.")
        return self.repo.SoftDelete(teamId)

    def AddMember(self, userId: UUID, addMemberSchema: AddTeamMember):
        team = self.GetTeamById(addMemberSchema.TeamId)
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")

        if team.CreatedBy != str(userId):
            raise HTTPException(status_code=403, detail="Only the creator of the team can add members.")

        if not self.userService.UserExistsById(addMemberSchema.UserIdToBeAdded):
            raise HTTPException(status_code=404, detail="User not found")

        exists = self.db.query(TeamMember).filter(
            TeamMember.TeamId == str(addMemberSchema.TeamId),
            TeamMember.UserId == str(addMemberSchema.UserIdToBeAdded),
            TeamMember.IsActive == True
        ).first()

        if exists:
            return {"message": "User is already a team member"}
        self.repo.AddMember(addMemberSchema)
        return {"message": "Team member successfully added"}

    def RemoveMember(self, userId: UUID, teamId: UUID, userIdToBeRemoved: UUID):
        team = self.GetTeamById(teamId)
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")

        if team.CreatedBy != str(userId):
            raise HTTPException(status_code=403, detail="Only the creator of the team can remove members.")

        # Validate member exists and is active before deletion
        member_exists = self.db.query(TeamMember).filter(
            TeamMember.TeamId == str(teamId),
            TeamMember.UserId == str(userIdToBeRemoved),
            TeamMember.IsActive == True
        ).first()

        if not member_exists:
            return {"message": "Team member removed successfully"}

        # Call repository to perform deletion
        self.repo.SoftDeleteMember(teamId, userIdToBeRemoved)

        return {"message": "Team member removed successfully"}

    def GetTeamMembers(self, teamId: UUID):
        team = self.GetTeamById(teamId)
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")

        members = self.db.query(TeamMember).filter(
            TeamMember.TeamId == str(teamId),
            TeamMember.IsActive == True
        ).all()

        return members

    def GetTeamTasks(self, teamId: UUID):
        team = self.GetTeamById(teamId)
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")

        return self.repo.GetTasks(teamId)
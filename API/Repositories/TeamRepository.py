from typing import Optional

from sqlalchemy.orm import Session

from Models import TeamMember, Task
from Models.Team import Team
from Schemas.TeamSchema import TeamCreate, TeamUpdate, AddTeamMember
from Db.session import SessionLocal
from uuid import UUID, uuid4
from datetime import datetime

class TeamRepository:
    def __init__(self):
        self.db: Session = SessionLocal()

    def Create(self, userId: UUID, teamData: TeamCreate):
        team = Team(
            Id=str(uuid4()),
            Name=teamData.Name,
            Description=teamData.Description,
            ColorIndex=teamData.ColorIndex,
            CreatedBy=str(userId),
            CreatedAt= datetime.now(),
            ProjectId = str(teamData.ProjectId),
        )
        self.db.add(team)
        self.db.commit()
        self.db.refresh(team)
        return team

    def GetAll(self):
        return self.db.query(Team).filter(Team.IsDeleted == False).all()

    def GetById(self, teamId: UUID) -> Optional[Team]:
        return self.db.query(Team).filter(Team.Id == str(teamId), Team.IsDeleted == False).first()

    def Update(self, teamId: UUID, teamUpdateSchema: TeamUpdate):
        team = self.GetById(teamId)
        print("Myauuuuuuu")
        print(team)
        for key, value in teamUpdateSchema.dict(exclude_unset=True).items():
            setattr(team, key, value)
        team.UpdatedAt = datetime.now()
        self.db.commit()
        self.db.refresh(team)
        return team

    def SoftDelete(self, teamId: UUID):
        team = self.GetById(teamId)
        if not team:
            return False

        # Soft delete the team
        team.IsDeleted = True
        team.UpdatedAt = datetime.now()

        # Soft delete all team members
        self.db.query(TeamMember).filter(
            TeamMember.TeamId == str(teamId),
            TeamMember.IsActive == True
        ).update({"IsActive": False}, synchronize_session=False)

        # Soft delete all tasks assigned to the team
        self.db.query(Task).filter(
            Task.TeamId == str(teamId),
            Task.IsDeleted == False
        ).update({"IsDeleted": True}, synchronize_session=False)

        self.db.commit()
        return True

    def AddMember(self, addTeamMemberSchema: AddTeamMember):
        member = TeamMember(
            TeamId=str(addTeamMemberSchema.TeamId),
            UserId=str(addTeamMemberSchema.UserIdToBeAdded),
            Role=addTeamMemberSchema.Role,
            IsLeader=addTeamMemberSchema.IsLeader
        )
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        return member

    def SoftDeleteMember(self, teamId: UUID, userId: UUID):
        # Step 1: Soft delete the team member directly
        self.db.query(TeamMember).filter(
            TeamMember.TeamId == str(teamId),
            TeamMember.UserId == str(userId),
            TeamMember.IsActive == True
        ).update({"IsActive": False}, synchronize_session=False)

        # Step 2: Soft delete tasks in this team assigned to the user
        self.db.query(Task).filter(
            Task.TeamId == str(teamId),
            Task.AssignedTo == str(userId),
            Task.IsDeleted == False
        ).update({"IsDeleted": True}, synchronize_session=False)

        self.db.commit()
        return True

    def GetTasks(self, teamId: UUID):
        team = self.GetById(teamId)
        return [task for task in team.Tasks if not task.IsDeleted]

    def __del__(self):
        self.db.close()

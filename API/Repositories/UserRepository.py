from pydantic import EmailStr
from sqlalchemy.orm import Session

from Models import Project, ProjectMember, TeamMember, Team
from Models.User import User
from uuid import UUID
from fastapi import HTTPException

from Schemas.UserSchema import AddUserSchema


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    from Models.User import User

    def Create(self, userData: AddUserSchema, hashedPassword: str):
        user = User(
            FirstName=userData.FirstName,
            LastName=userData.LastName,
            Email=userData.Email,
            Password=hashedPassword
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def GetById(self, userId: UUID) -> User:
        user = self.db.query(User).filter(User.Id == str(userId)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def GetByEmail(self, email: EmailStr) -> User:
        user = self.db.query(User).filter(User.Email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def ExistsById(self, userId: UUID) -> bool:
        return self.db.query(User).filter(User.Id == str(userId)).first() is not None

    def GetUserProjects(self, userId: UUID):
        owned_projects = self.db.query(Project).filter(
            Project.OwnerId == str(userId),
            Project.IsDeleted == False
        )

        member_projects = self.db.query(Project).join(ProjectMember).filter(
            ProjectMember.UserId == str(userId),
            ProjectMember.IsDeleted == False,
            Project.IsDeleted == False
        )

        return owned_projects.union(member_projects).all()

    def GetUserTeams(self, userId: UUID):
        members = self.db.query(TeamMember).join(TeamMember.Team).filter(
            TeamMember.UserId == str(userId),
            TeamMember.IsActive == True,
            TeamMember.Team.has(Team.IsDeleted == False)
        ).all()

        return [member.Team for member in members]

    def GetUserAssignedTasks(self, userId: UUID):
        user = self.GetById(userId)
        return [task for task in user.TasksAssigned if not task.IsDeleted]

    def GetUserCreatedTasks(self, userId: UUID):
        user = self.GetById(userId)
        return [task for task in user.TasksCreated if not task.IsDeleted]

from pydantic import EmailStr
from sqlalchemy.orm import Session

from Models import Project, ProjectMember, TeamMember, Team
from Models.User import User
from uuid import UUID
from fastapi import HTTPException, UploadFile

from Schemas.UserSchema import AddUserSchema
from Schemas.UserSchema import UserResponseSchema

from Models.Attachment import Attachment, AttachmentEntityType
from Repositories.AttachmentRepository import UploadToUniServer

import paramiko
import os



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
    
    def CheckEmail(self, email: EmailStr) -> User:
        user = self.db.query(User).filter(User.Email == email).first()
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

    def UpdatePassword(self, user: User, newPassword: str):

        user.Password = newPassword

        self.db.commit()
        self.db.refresh(user)
        return user
    
    def GetCurrentUserData(db: Session, currentUser: User) -> UserResponseSchema:
        user: User = db.query(User).filter(User.Id == currentUser.Id, User.IsDeleted == False).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        userSchema: UserResponseSchema = UserResponseSchema.from_orm(user)

        # Manually inject ProfilePictureUrl if picture exists
        if user.ProfilePictureId:
            profilePic = db.query(Attachment).filter(
                Attachment.Id == user.ProfilePictureId,
                Attachment.IsDeleted == False
            ).first()

        if profilePic:
            baseUrl = "http://clabsql.clamv.constructor.university/~mabaszada/"
            fileName = os.path.basename(profilePic.FilePath)
            userSchema.ProfilePicture = profilePic  # fills nested object
            userSchema.ProfilePictureUrl = f"{baseUrl}{fileName}"

        return userSchema
    
    def UploadProfilePicture(
        db: Session,
        file: UploadFile,
        currentUser: User
    ):
        # Save file temporarily
        tempLocalPath = os.path.join("temp_uploads", file.filename)
        os.makedirs("temp_uploads", exist_ok=True)

        with open(tempLocalPath, "wb") as buffer:
            buffer.write(file.file.read())

        # Upload to server and remove local file
        remotePath = UploadToUniServer(tempLocalPath, file.filename)
        fileSize = os.path.getsize(tempLocalPath)
        os.remove(tempLocalPath)

        # Create Attachment record for profile picture
        attachment = Attachment(
            FileName=file.filename,
            FileType=file.content_type,
            FileSize=fileSize,
            FilePath=remotePath.replace("/home/mabaszada/", "/"),
            EntityType=AttachmentEntityType.USER,
            EntityId=currentUser.Id,
            OwnerId=currentUser.Id,
            ProjectId=None 
        )

        db.add(attachment)
        db.commit()
        db.refresh(attachment)

        currentUser.ProfilePictureId = attachment.Id

        db.commit()
        db.refresh(currentUser)
        return attachment
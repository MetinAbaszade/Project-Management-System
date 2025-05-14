from fastapi import Depends, HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import EmailStr
from Services.EmailService import EmailService

from Repositories.UserRepository import UserRepository
from Schemas.UserSchema import AddUserSchema, UpdatePasswordSchema
from Dependencies.db import GetDb
from Dependencies.auth import HashPassword
from Models.User import User


class UserService:
    def __init__(self, db: Session = Depends(GetDb)):
        self.db = db
        self.repo = UserRepository(db)

    def CreateUser(self, userData: AddUserSchema):
        try:
            self.GetUserByEmail(userData.Email)
            raise HTTPException(status_code=400, detail="Email is already registered")
        except HTTPException as e:
            if e.status_code != 404:
                raise e  # Reraise other unexpected errors
            
        if not EmailService().IsEmailVerified(userData.Email):
            raise HTTPException(status_code=400, detail="Email is not verified")

        hashedPassword = HashPassword(userData.Password)
        return self.repo.Create(userData, hashedPassword)

    def GetUserById(self, userId: UUID):
        return self.repo.GetById(userId)

    def GetUserByEmail(self, email: EmailStr):
        return self.repo.GetByEmail(email)

    def UserExistsById(self, userId: UUID):
        return self.repo.ExistsById(userId)

    def GetUserProjects(self, userId: UUID):
        return self.repo.GetUserProjects(userId)

    def GetUserTeams(self, userId: UUID):
        return self.repo.GetUserTeams(userId)

    def GetUserAssignedTasks(self, userId: UUID):
        return self.repo.GetUserAssignedTasks(userId)

    def GetUserCreatedTasks(self, userId: UUID):
        return self.repo.GetUserCreatedTasks(userId)

    def UpdatePassword(self, email: str, newPassword: str):
        hashedPassword = HashPassword(newPassword)
        user = self.repo.GetByEmail(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User with this email does not exist."
            )

        if not EmailService().IsEmailVerified(email):
            raise HTTPException(status_code=400, detail="Email is not verified")
        
        return self.repo.UpdatePassword(user, hashedPassword)
    def GetCurrentUserData (db: Session, currentUser: User):
        user = UserService.GetUserById(currentUser.Id)
        if not user:
                raise HTTPException(status_code=400, detail="User not found")
        
        return UserRepository.GetCurrentUserData(db, currentUser)
    
    def UploadProfilePicture(
        db: Session,
        file: UploadFile,
        currentUserId: str
    ):
        # No project access check needed for profile picture upload
        return UserRepository.UploadProfilePicture(
            db=db,
            file=file,
            currentUserId=currentUserId
        )
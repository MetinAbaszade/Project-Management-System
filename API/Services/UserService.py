from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import EmailStr

from Repositories.UserRepository import UserRepository
from Schemas.UserSchema import AddUserSchema
from Dependencies.db import GetDb
from Dependencies.auth import HashPassword


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


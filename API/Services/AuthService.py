from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from Schemas.AuthSchema import RegisterSchema, LoginSchema
from Dependencies.auth import VerifyPassword, CreateAccessToken
from Dependencies.db import GetDb
from Schemas.UserSchema import AddUserSchema
from Services.UserService import UserService  # ✅ now using UserService


class AuthService:
    def __init__(self, db: Session = Depends(GetDb)):
        self.userService = UserService(db)

    def LoginUser(self, userData: LoginSchema):
        user = self.userService.GetUserByEmail(userData.Email)
        if not VerifyPassword(userData.Password, user.Password):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        accessToken = CreateAccessToken({"sub": str(user.Id)})
        return {"access_token": accessToken, "token_type": "bearer"}

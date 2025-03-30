from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from Repositories.AuthRepository import AuthRepository
from Schemas.AuthSchema import RegisterSchema, LoginSchema
from Dependencies.auth import VerifyPassword, CreateAccessToken
# from Db.session import SessionLocal
from Dependencies.db import GetDb


class AuthService:
    def __init__(self, db: Session = Depends(GetDb)):  # ✅ CORRECT
        self.authRepository = AuthRepository(db)

    def RegisterUser(self, userData: RegisterSchema):
        existingUser = self.authRepository.GetUserByEmail(userData.Email)
        if existingUser:
            raise HTTPException(status_code=400, detail="Email already registered")

        return self.authRepository.CreateUser(userData)

    def LoginUser(self, userData: LoginSchema):
        user = self.authRepository.GetUserByEmail(userData.Email)
        if not user or not VerifyPassword(userData.Password, user.Password):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        accessToken = CreateAccessToken({"sub": str(user.Id)})
        return {"access_token": accessToken, "token_type": "bearer"}

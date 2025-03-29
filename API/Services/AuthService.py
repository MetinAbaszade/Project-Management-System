from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from Repositories.AuthRepository import AuthRepository
from Schemas.AuthSchema import RegisterSchema, LoginSchema
from Dependencies.auth import verify_password, create_access_token
# from Db.session import SessionLocal
from Dependencies.db import get_db


class AuthService:
    def __init__(self, db: Session = Depends(get_db)):  # ✅ CORRECT
        self.auth_repository = AuthRepository(db)

    def register_user(self, user_data: RegisterSchema):
        existing_user = self.auth_repository.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        return self.auth_repository.create_user(user_data)

    def login_user(self, user_data: LoginSchema):
        user = self.auth_repository.get_user_by_email(user_data.email)
        if not user or not verify_password(user_data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        access_token = create_access_token({"sub": str(user.id)})
        return {"access_token": access_token, "token_type": "bearer"}

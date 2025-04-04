from sqlalchemy.orm import Session
from Models.User import User
from Schemas.AuthSchema import RegisterSchema
from Dependencies.auth import HashPassword

class AuthRepository:
    def __init__(self, db: Session):
        self.db = db

    def GetUserByEmail(self, email: str) -> User:
        return self.db.query(User).filter(User.Email == email).first()

    def CreateUser(self, userData: RegisterSchema):
        hashed_password = HashPassword(userData.Password)
        newUser = User(
            FirstName=userData.FirstName,
            LastName=userData.LastName,
            Email=userData.Email,
            Password=hashed_password,
        )
        self.db.add(newUser)
        self.db.commit()
        self.db.refresh(newUser)
        return newUser
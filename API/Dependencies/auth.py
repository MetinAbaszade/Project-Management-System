from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Security
from fastapi.security.api_key import APIKeyHeader


from sqlalchemy.orm import Session
from Models.User import User
from Dependencies.db import GetDb

# Secure password hashing
PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")

def HashPassword(password: str) -> str:
    return PWD_CONTEXT.hash(password)

def VerifyPassword(plainPassword: str, hashedPassword: str) -> bool:
    return PWD_CONTEXT.verify(plainPassword, hashedPassword)

# JWT Configuration
SECRET_KEY = "Qabil_Fonzi_AAAIIYYY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def CreateAccessToken(data: dict, expiresDelta: timedelta = None):
    toEncode = data.copy()
    expire = datetime.now(timezone.utc) + (expiresDelta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    toEncode.update({"exp": expire})
    return jwt.encode(toEncode, SECRET_KEY, algorithm=ALGORITHM)

api_key_header = APIKeyHeader(name="Authorization", auto_error=False)

def GetCurrentUser(token: str = Security(api_key_header), db: Session = Depends(GetDb)) -> User:
    credentialsException = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentialsException  

    if token.startswith("Bearer "):
        token = token.split(" ", 1)[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        userId: str = payload.get("sub")
        if userId is None:
            raise credentialsException
    except JWTError:
        raise credentialsException

    user = db.query(User).filter(User.Id == userId).first()
    if user is None:
        raise credentialsException

    return user
from fastapi import APIRouter, Depends
from Services.AuthService import AuthService
from Services.UserService import UserService
from Schemas.UserSchema import AddUserSchema
from Schemas.AuthSchema import LoginSchema

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
def RegisterUser(userData: AddUserSchema, userService: UserService = Depends()):
    return userService.CreateUser(userData)

@router.post("/login")
def LoginUser(userData: LoginSchema, authService: AuthService = Depends()):
    print("Received login request:", userData)
    return authService.LoginUser(userData)

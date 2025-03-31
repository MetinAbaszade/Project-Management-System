from fastapi import APIRouter, Depends
from Services.AuthService import AuthService
from Schemas.AuthSchema import RegisterSchema, LoginSchema

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/test")
def TestAuth():
    return {"message": "Authentication API is working!"}

@router.post("/register")
def RegisterUser(userData: RegisterSchema, authService: AuthService = Depends()):
    return authService.RegisterUser(userData)

@router.post("/login")
def LoginUser(userData: LoginSchema, authService: AuthService = Depends()):
    print("Received login request:", userData)
    return authService.LoginUser(userData)

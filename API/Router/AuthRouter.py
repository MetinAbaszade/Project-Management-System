from fastapi import APIRouter, Depends
from Services.AuthService import AuthService
from Schemas.AuthSchema import RegisterSchema, LoginSchema

router = APIRouter(tags=["Authentication"])

@router.get("/test")
def test_auth():
    return {"message": "Authentication API is working!"}

@router.post("/register")
def register_user(user_data: RegisterSchema, auth_service: AuthService = Depends()):
    return auth_service.register_user(user_data)

@router.post("/login")
def login_user(user_data: LoginSchema, auth_service: AuthService = Depends()):
    return auth_service.login_user(user_data)

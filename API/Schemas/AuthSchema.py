from pydantic import BaseModel, EmailStr

class RegisterSchema(BaseModel):
    FirstName: str
    LastName: str
    Email: EmailStr
    Password: str

class LoginSchema(BaseModel):
    Email: EmailStr
    Password: str

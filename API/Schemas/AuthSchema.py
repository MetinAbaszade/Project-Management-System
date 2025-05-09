from pydantic import BaseModel, EmailStr, Field


class RegisterSchema(BaseModel):
    FirstName: str
    LastName: str
    Email: EmailStr
    Password: str

class LoginSchema(BaseModel):
    Email: EmailStr = Field(..., example="johndoe@example.com")
    Password: str = Field(..., min_length=6, example="securepassword123")
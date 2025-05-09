from pydantic import BaseModel, EmailStr, Field


class AddUserSchema(BaseModel):
    FirstName: str = Field(..., example="John")
    LastName: str = Field(..., example="Doe")
    Email: EmailStr = Field(..., example="johndoe@example.com")
    Password: str = Field(..., min_length=6, example="securepassword123")

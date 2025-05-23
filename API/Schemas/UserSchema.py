from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional


class AddUserSchema(BaseModel):
    FirstName: str = Field(..., example="John")
    LastName: str = Field(..., example="Doe")
    Email: EmailStr = Field(..., example="johndoe@example.com")
    Password: str = Field(..., min_length=6, example="securepassword123")


class UpdatePasswordSchema(BaseModel):
    Email: EmailStr
    NewPassword: str = Field(..., min_length=6)


class ProfilePictureSchema(BaseModel):
    FileName: str
    FileType: Optional[str]
    FileSize: Optional[int]
    FilePath: str
    OwnerId: str

    model_config = ConfigDict(from_attributes=True)


class UserResponseSchema(BaseModel):
    Id: str
    FirstName: str
    LastName: str
    Email: str
    Role: str
    JobTitle: Optional[str]
    ProfilePicture: Optional[ProfilePictureSchema]
    ProfilePictureUrl: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

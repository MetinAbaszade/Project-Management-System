from pydantic import BaseModel, EmailStr

# User Registration Schema
class RegisterSchema(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

# User Login Schema
class LoginSchema(BaseModel):
    email: EmailStr
    password: str

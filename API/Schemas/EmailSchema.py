from pydantic import BaseModel, EmailStr

class ResponseDTO(BaseModel):
    Success: bool
    Message: str

class CheckVerificationCodeDTO(BaseModel):
    Email: EmailStr
    VerificationCode: str

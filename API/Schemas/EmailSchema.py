from pydantic import BaseModel, EmailStr

class ResponseDTO(BaseModel):
    success: bool
    message: str

class CheckVerificationCodeDTO(BaseModel):
    email: EmailStr
    verification_code: str

from fastapi import APIRouter, Depends
from Services.EmailService import EmailService
from Schemas.EmailSchema import ResponseDTO, CheckVerificationCodeDTO

router = APIRouter(
    prefix="/email",
    tags=["Email Verification"]
)

@router.post("/send-verification-code", response_model=ResponseDTO)
def SendVerificationCode(recipientEmail: str, emailService: EmailService = Depends()):
    return emailService.SendVerificationCode(recipientEmail)

@router.post("/check-verification-code", response_model=ResponseDTO)
def check_verification_code(verificationCodeDto: CheckVerificationCodeDTO, emailService: EmailService = Depends()):
    return emailService.CheckVerificationCode(verificationCodeDto)

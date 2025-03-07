from fastapi import APIRouter, Depends
from Services.EmailService import EmailService
from Schemas.EmailSchema import ResponseDTO, CheckVerificationCodeDTO

router = APIRouter(
    prefix="/email",
    tags=["Email Verification"]
)
@router.post("/hello")
def test():
    return "Hello World"

@router.post("/send-verification-code", response_model=ResponseDTO)
def send_verification_code(recipient_email: str, emailService: EmailService = Depends()):
    return emailService.send_verification_code(recipient_email)

@router.post("/check-verification-code", response_model=ResponseDTO)
def check_verification_code(verification_code_dto: CheckVerificationCodeDTO, emailService: EmailService = Depends()):
    return emailService.check_verification_code(verification_code_dto)

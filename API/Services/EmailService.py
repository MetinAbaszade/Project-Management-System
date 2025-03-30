import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from cachetools import TTLCache
from Schemas.EmailSchema import ResponseDTO, CheckVerificationCodeDTO

# Use a Global Cache to persist verification codes across multiple API calls
verification_cache = TTLCache(maxsize=1000, ttl=120)

class EmailService:
    def __init__(self):
        self.cache = verification_cache
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = "abaszadamatin@gmail.com"
        self.sender_password = "kist anui czqz dery"

    def SendEmail(self, recipient_email: str, subject: str, body: str):
        """ Sends an email to the recipient. """
        try:
            msg = MIMEMultipart()
            msg["From"] = self.sender_email
            msg["To"] = recipient_email
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "html"))

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, recipient_email, msg.as_string())

            print(f"Email sent to {recipient_email}")
        except Exception as e:
            print(f"Failed to send email: {e}")

    def GenerateVerificationCode(self) -> str:
        """ Generates a 6-digit random verification code. """
        return "".join(random.choices(string.digits, k=6))

    def GenerateVerificationEmail(self, verification_code: str) -> str:
        """ Generates an email body with the verification code. """
        return f"""
        <html>
            <body>
                <h2>Verification Code</h2>
                <p>Your verification code is: <strong>{verification_code}</strong></p>
                <p>This code will expire in 2 minutes.</p>
            </body>
        </html>
        """

    def SendVerificationCode(self, recipientEmail: str) -> ResponseDTO:
        """ Sends a verification email and stores the code in memory for 2 minutes. """
        print("Inside send_verification_code")
        print(self.cache)

        if not self.can_request_verification_code(recipient_email):
            return ResponseDTO(success=False, message="Please wait before requesting a new code")

        verification_code = self.generate_verification_code()
        self.store_verification_code_in_cache(recipient_email, verification_code)

        email_body = self.generate_verification_email(verification_code)
        self.send_email(recipient_email, "Your Verification Code", email_body)

        return ResponseDTO(success=True, message="Verification code sent successfully")

    def CanRequestVerificationCode(self, email: str) -> bool:
        """ Checks if a verification code can be requested. Returns False if a code exists in cache. """
        if email in self.cache:
            print(f"Request blocked: A verification code was recently sent to {email}. Wait for expiration.")
            return False
        return True

    def StoreVerificationCodeInCache(self, email: str, verification_code: str):
        """ Stores the verification code in memory with a 2-minute expiration. """
        self.cache[email] = verification_code
        print(f"Stored verification code for {email}: {verification_code} (expires in 2 minutes)")

    def CheckVerificationCode(self, verificationCodeDto: CheckVerificationCodeDTO) -> ResponseDTO:
        """ Validates the user's verification code. """
        email = verification_code_dto.email
        provided_code = verification_code_dto.verification_code

        stored_code = self.cache.get(email)
        if stored_code and stored_code == provided_code:
            del self.cache[email]  # Remove the used code
            return ResponseDTO(success=True, message="Verification successful")

        return ResponseDTO(success=False, message="Invalid or expired verification code")

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from fastapi import HTTPException
from app.config import get_settings
from app.utils.logger import logger
from app.utils.mask import mask_email, mask_token

settings = get_settings()

mail_config = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

fast_mail = FastMail(mail_config)


async def send_verification_email(email: str, token: str) -> None:
    try:
        masked_email = mask_email(email)
        masked_token = mask_token(token)
        logger.info(f"Email Service: Sending verification email - email: {masked_email}, token: {masked_token}")
        
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        logger.debug(f"Email Service: Creating verification email message - email: {masked_email}")
        
        html = f"""
        <html>
            <body>
                <h2>Verify Your Email</h2>
                <p>Click the link below to verify your email address:</p>
                <a href="{verification_url}">{verification_url}</a>
                <p>This link expires in 24 hours.</p>
            </body>
        </html>
        """
        message = MessageSchema(
            subject="Verify Your Email",
            recipients=[email],
            body=html,
            subtype=MessageType.html
        )
        
        logger.debug(f"Email Service: Sending verification email via SMTP - email: {masked_email}")
        await fast_mail.send_message(message)
        
        logger.info(f"Email Service: Verification email sent successfully - email: {masked_email}, token: {masked_token}")
    except ConnectionError as e:
        logger.error(f"Email Service: SMTP connection error sending verification email - email: {mask_email(email)}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to connect to email server. Please try again later."
        )
    except TimeoutError as e:
        logger.error(f"Email Service: Email sending timeout - email: {mask_email(email)}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Email sending timed out. Please try again later."
        )
    except ValueError as e:
        logger.error(f"Email Service: Invalid email format or settings - email: {mask_email(email)}, error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid email configuration: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Email Service: Unexpected error sending verification email - email: {mask_email(email)}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to send verification email. Please try again later."
        )


async def send_password_reset_email(email: str, token: str) -> None:
    try:
        masked_email = mask_email(email)
        masked_token = mask_token(token)
        logger.info(f"Email Service: Sending password reset email - email: {masked_email}, token: {masked_token}")
        
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        logger.debug(f"Email Service: Creating password reset email message - email: {masked_email}")
        
        html = f"""
        <html>
            <body>
                <h2>Reset Your Password</h2>
                <p>Click the link below to reset your password:</p>
                <a href="{reset_url}">{reset_url}</a>
                <p>This link expires in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </body>
        </html>
        """
        message = MessageSchema(
            subject="Reset Your Password",
            recipients=[email],
            body=html,
            subtype=MessageType.html
        )
        
        logger.debug(f"Email Service: Sending password reset email via SMTP - email: {masked_email}")
        await fast_mail.send_message(message)
        
        logger.info(f"Email Service: Password reset email sent successfully - email: {masked_email}, token: {masked_token}")
    except ConnectionError as e:
        logger.error(f"Email Service: SMTP connection error sending password reset email - email: {mask_email(email)}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to connect to email server. Please try again later."
        )
    except TimeoutError as e:
        logger.error(f"Email Service: Email sending timeout - email: {mask_email(email)}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Email sending timed out. Please try again later."
        )
    except ValueError as e:
        logger.error(f"Email Service: Invalid email format or settings - email: {mask_email(email)}, error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid email configuration: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Email Service: Unexpected error sending password reset email - email: {mask_email(email)}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to send password reset email. Please try again later."
        )


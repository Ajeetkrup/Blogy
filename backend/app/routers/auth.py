from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Request
from typing import Optional
from pydantic import ValidationError
from jose.exceptions import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.logger import logger
from app.middleware.rate_limiter import (
    limiter,
    AUTH_RATE_LIMIT,
    AUTH_RATE_LIMIT_PER_HOUR
)
from app.schemas.auth import (
    UserCreate,
    UserResponse,
    LoginRequest,
    TokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
)
from app.services.auth import (
    get_user_by_email,
    create_user,
    verify_password,
    create_access_token,
    create_refresh_token,
    validate_refresh_token,
    revoke_refresh_token,
    verify_user_email,
    create_password_reset_token,
    reset_user_password,
)
from app.services.email import send_verification_email, send_password_reset_email
from app.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.config import get_settings
from app.utils.mask import mask_email, mask_token

router = APIRouter()
settings = get_settings()

REFRESH_TOKEN_COOKIE = "refresh_token"
ACCESS_TOKEN_COOKIE = "access_token"


def set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE,
        value=token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )


def clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=REFRESH_TOKEN_COOKIE, httponly=True, secure=True, samesite="lax")


def set_access_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE,
        value=token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


def clear_access_cookie(response: Response) -> None:
    response.delete_cookie(key=ACCESS_TOKEN_COOKIE, httponly=True, secure=True, samesite="lax")


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(AUTH_RATE_LIMIT)
@limiter.limit(AUTH_RATE_LIMIT_PER_HOUR)
async def register(request: Request, user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        masked_email = mask_email(user_data.email)
        logger.info(f"Router: Registration attempt - email: {masked_email}")
        
        existing_user = await get_user_by_email(db, user_data.email)
        if existing_user:
            logger.warning(f"Router: Registration failed - email already registered: {masked_email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        logger.debug(f"Router: Creating user - email: {masked_email}")
        user = await create_user(db, user_data.email, user_data.password)
        
        logger.debug(f"Router: Sending verification email - email: {masked_email}")
        await send_verification_email(user.email, user.verification_token)
        
        logger.info(f"Router: Registration successful - user_id: {user.id}, email: {masked_email}")
        return {"message": "Registration successful. Please check your email to verify your account."}
    except HTTPException as e:
        logger.warning(f"Router: Registration failed with HTTP exception - email: {mask_email(user_data.email)}, status: {e.status_code}, detail: {e.detail}")
        raise
    except ValidationError as e:
        logger.error(f"Router: Validation error during registration - email: {mask_email(user_data.email)}, errors: {e.errors()}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Router: Database error during registration - email: {mask_email(user_data.email)}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred during registration. Please try again later."
        )


@router.get("/verify-email/{token}", response_model=MessageResponse)
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    try:
        masked_token = f"{token[:4]}...{token[-4:]}" if len(token) > 8 else "***"
        logger.info(f"Router: Email verification attempt - token: {masked_token}")
        
        user = await verify_user_email(db, token)
        if not user:
            logger.warning(f"Router: Email verification failed - invalid or expired token: {masked_token}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token"
            )
        
        logger.info(f"Router: Email verified successfully - user_id: {user.id}, email: {mask_email(user.email)}")
        return {"message": "Email verified successfully. You can now log in."}
    except HTTPException as e:
        logger.warning(f"Router: Email verification failed with HTTP exception - token: {mask_token(token) if len(token) > 8 else '***'}, status: {e.status_code}")
        raise
    except ValueError as e:
        logger.error(f"Router: Invalid token format - token: {mask_token(token) if len(token) > 8 else '***'}, error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid token format: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Router: Database error during email verification - token: {mask_token(token) if len(token) > 8 else '***'}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred during email verification. Please try again later."
        )


@router.post("/login", response_model=TokenResponse)
@limiter.limit(AUTH_RATE_LIMIT)
@limiter.limit(AUTH_RATE_LIMIT_PER_HOUR)
async def login(
    request: Request,
    login_data: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    try:
        masked_email = mask_email(login_data.email)
        logger.info(f"Router: Login attempt - email: {masked_email}")
        
        user = await get_user_by_email(db, login_data.email)
        
        if not user:
            logger.warning(f"Router: Login failed - user not found: {masked_email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        logger.debug(f"Router: Verifying password for user_id: {user.id}, email: {masked_email}")
        if not verify_password(login_data.password, user.hashed_password):
            logger.warning(f"Router: Login failed - invalid password: user_id: {user.id}, email: {masked_email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        if not user.is_verified:
            logger.warning(f"Router: Login failed - email not verified: user_id: {user.id}, email: {masked_email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please verify your email before logging in"
            )
        
        logger.debug(f"Router: Creating tokens for user_id: {user.id}, email: {masked_email}")
        access_token = create_access_token(user.id)
        refresh_token = await create_refresh_token(db, user.id)
        
        logger.debug(f"Router: Setting refresh token cookie for user_id: {user.id}")
        set_refresh_cookie(response, refresh_token)
        
        logger.debug(f"Router: Setting access token cookie for user_id: {user.id}")
        set_access_cookie(response, access_token)
        
        logger.info(f"Router: Login successful - user_id: {user.id}, email: {masked_email}")
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException as e:
        logger.warning(f"Router: Login failed with HTTP exception - email: {mask_email(login_data.email)}, status: {e.status_code}, detail: {e.detail}")
        raise
    except ValidationError as e:
        logger.error(f"Router: Validation error during login - email: {mask_email(login_data.email)}, errors: {e.errors()}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {str(e)}"
        )
    except JWTError as e:
        logger.error(f"Router: JWT error during login - email: {mask_email(login_data.email)}, error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating authentication token"
        )
    except Exception as e:
        logger.error(f"Router: Database error during login - email: {mask_email(login_data.email)}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred during login. Please try again later."
        )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    response: Response,
    db: AsyncSession = Depends(get_db),
    refresh_token: Optional[str] = Cookie(None, alias=REFRESH_TOKEN_COOKIE)
):
    try:
        masked_token = f"{refresh_token[:4]}...{refresh_token[-4:]}" if refresh_token and len(refresh_token) > 8 else "none"
        logger.info(f"Router: Logout attempt - refresh_token: {masked_token}")
        
        if refresh_token:
            logger.debug(f"Router: Revoking refresh token - token: {masked_token}")
            await revoke_refresh_token(db, refresh_token)
            logger.debug(f"Router: Refresh token revoked successfully - token: {masked_token}")
        else:
            logger.debug(f"Router: No refresh token provided for logout")
        
        logger.debug(f"Router: Clearing refresh token cookie")
        clear_refresh_cookie(response)
        
        logger.debug(f"Router: Clearing access token cookie")
        clear_access_cookie(response)
        
        logger.info(f"Router: Logout successful - token: {masked_token}")
        return {"message": "Logged out successfully"}
    except Exception as e:
        logger.error(f"Router: Database error during logout - token: {mask_token(refresh_token) if refresh_token else 'none'}, error: {str(e)}", exc_info=True)
        # Still clear cookies even if revocation fails
        clear_refresh_cookie(response)
        clear_access_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred during logout. Cookies have been cleared."
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    response: Response,
    db: AsyncSession = Depends(get_db),
    refresh_token: Optional[str] = Cookie(None, alias=REFRESH_TOKEN_COOKIE)
):
    try:
        masked_token = f"{refresh_token[:4]}...{refresh_token[-4:]}" if refresh_token and len(refresh_token) > 8 else "none"
        logger.info(f"Router: Token refresh attempt - refresh_token: {refresh_token}")
        
        if not refresh_token:
            logger.warning(f"Router: Token refresh failed - refresh token not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token not found"
            )
        
        logger.debug(f"Router: Validating refresh token - token: {masked_token}")
        user = await validate_refresh_token(db, refresh_token)
        if not user:
            logger.warning(f"Router: Token refresh failed - invalid or expired token: {masked_token}")
            clear_refresh_cookie(response)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        logger.debug(f"Router: Revoking old refresh token - token: {masked_token}, user_id: {user.id}")
        await revoke_refresh_token(db, refresh_token)
        
        logger.debug(f"Router: Creating new tokens for user_id: {user.id}")
        access_token = create_access_token(user.id)
        new_refresh_token = await create_refresh_token(db, user.id)
        
        logger.debug(f"Router: Setting new refresh token cookie for user_id: {user.id}")
        set_refresh_cookie(response, new_refresh_token)
        
        logger.debug(f"Router: Setting new access token cookie for user_id: {user.id}")
        set_access_cookie(response, access_token)
        
        logger.info(f"Router: Token refresh successful - user_id: {user.id}, email: {mask_email(user.email)}")
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException as e:
        logger.warning(f"Router: Token refresh failed with HTTP exception - token: {mask_token(refresh_token) if refresh_token else 'none'}, status: {e.status_code}")
        raise
    except JWTError as e:
        logger.error(f"Router: JWT error during token refresh - token: {mask_token(refresh_token) if refresh_token else 'none'}, error: {str(e)}")
        clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    except Exception as e:
        logger.error(f"Router: Database error during token refresh - token: {mask_token(refresh_token) if refresh_token else 'none'}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred during token refresh. Please try again later."
        )


@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit(AUTH_RATE_LIMIT)
@limiter.limit(AUTH_RATE_LIMIT_PER_HOUR)
async def forgot_password(request: Request, data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    try:
        masked_email = mask_email(data.email)
        logger.info(f"Router: Forgot password request - email: {masked_email}")
        
        user = await get_user_by_email(db, data.email)
        if not user:
            logger.warning(f"Router: User not found for password reset - email: {masked_email}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email does not exist in our system"
            )
        
        logger.debug(f"Router: User found, creating password reset token - email: {masked_email}, user_id: {user.id}")
        token = await create_password_reset_token(db, user)
        
        logger.debug(f"Router: Sending password reset email - email: {masked_email}")
        await send_password_reset_email(user.email, token)
        logger.info(f"Router: Password reset email sent successfully - email: {masked_email}, user_id: {user.id}")
        
        return {"message": "Password reset link has been sent to your email."}
    except HTTPException:
        raise
    except ValidationError as e:
        logger.error(f"Router: Validation error during forgot password - email: {mask_email(data.email)}, errors: {e.errors()}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Router: Database error during forgot password - email: {mask_email(data.email)}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Please try again later."
        )


@router.post("/reset-password/{token}", response_model=MessageResponse)
@limiter.limit(AUTH_RATE_LIMIT)
@limiter.limit(AUTH_RATE_LIMIT_PER_HOUR)
async def reset_password(
    request: Request,
    token: str,
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        masked_token = f"{token[:4]}...{token[-4:]}" if len(token) > 8 else "***"
        logger.info(f"Router: Password reset attempt - token: {masked_token}")
        
        user = await reset_user_password(db, token, data.password)
        if not user:
            logger.warning(f"Router: Password reset failed - invalid or expired token: {masked_token}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        logger.info(f"Router: Password reset successful - user_id: {user.id}, email: {mask_email(user.email)}")
        return {"message": "Password reset successfully. You can now log in with your new password."}
    except HTTPException as e:
        logger.warning(f"Router: Password reset failed with HTTP exception - token: {mask_token(token) if len(token) > 8 else '***'}, status: {e.status_code}")
        raise
    except ValueError as e:
        logger.error(f"Router: Invalid token format or password - token: {mask_token(token) if len(token) > 8 else '***'}, error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid input: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Router: Database error during password reset - token: {mask_token(token) if len(token) > 8 else '***'}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred during password reset. Please try again later."
        )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    try:
        logger.info(f"Router: Getting current user info - user_id: {current_user.id}, email: {mask_email(current_user.email)}")
        return current_user
    except HTTPException as e:
        # HTTPException from get_current_user dependency (authentication errors)
        logger.warning(f"Router: Get current user failed - status: {e.status_code}, detail: {e.detail}")
        raise
    except Exception as e:
        logger.error(f"Router: Unexpected error getting current user - user_id: {current_user.id if current_user else 'unknown'}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while fetching user information."
        )

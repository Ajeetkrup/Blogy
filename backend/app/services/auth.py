from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_
from app.config import get_settings
from app.models.user import User, RefreshToken
from app.utils.logger import logger
from app.utils.mask import mask_email, mask_token

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: int) -> str:
    try:
        logger.debug(f"Service: Creating access token for user_id: {user_id}")
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {"sub": str(user_id), "exp": expire, "type": "access"}
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        logger.debug(f"Service: Access token created successfully for user_id: {user_id}")
        return token
    except JWTError as e:
        logger.error(f"Service: JWT error creating access token - user_id: {user_id}, error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error creating access token"
        )
    except ValueError as e:
        logger.error(f"Service: Invalid input creating access token - user_id: {user_id}, error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid input: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Service: Unexpected error creating access token - user_id: {user_id}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Unexpected error creating access token"
        )


def decode_access_token(token: str) -> Optional[int]:
    try:
        masked_token = mask_token(token)
        logger.debug(f"Service: Decoding access token - token: {masked_token}")
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            logger.warning(f"Service: Invalid token type - token: {masked_token}")
            return None
        user_id = payload.get("sub")
        result = int(user_id) if user_id else None
        if result:
            logger.debug(f"Service: Access token decoded successfully - user_id: {result}, token: {masked_token}")
        else:
            logger.warning(f"Service: No user_id in token payload - token: {masked_token}")
        return result
    except JWTError as e:
        logger.warning(f"Service: JWT error decoding access token - token: {mask_token(token)}, error: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Service: Unexpected error decoding access token - token: {mask_token(token)}, error: {str(e)}", exc_info=True)
        return None


def generate_token() -> str:
    return str(uuid.uuid4())


async def create_refresh_token(db: AsyncSession, user_id: int) -> str:
    try:
        logger.info(f"Service: Creating refresh token for user_id: {user_id}")
        
        logger.debug(f"Service: Generating refresh token for user_id: {user_id}")
        token = generate_token()
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        logger.debug(f"Service: Inserting refresh token to database for user_id: {user_id}")
        refresh_token = RefreshToken(
            token=token,
            user_id=user_id,
            expires_at=expires_at,
            revoked=False
        )
        db.add(refresh_token)
        await db.flush()  # Use flush() instead of commit() - let get_db() handle the commit
        await db.refresh(refresh_token)
        
        logger.info(f"Service: Refresh token created successfully for user_id: {user_id}, token: {mask_token(token)}")
        return token
    except Exception as e:
        await db.rollback()
        logger.error(f"Service: Error creating refresh token - user_id: {user_id}, error: {str(e)}", exc_info=True)
        error_str = str(e).lower()
        if "duplicate" in error_str or "unique" in error_str:
            raise HTTPException(
                status_code=500,
                detail="Error creating refresh token"
            )
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while creating refresh token"
        )


async def validate_refresh_token(db: AsyncSession, token: str) -> Optional[User]:
    try:
        masked_token = mask_token(token)
        logger.info(f"Service: Validating refresh token - token: {masked_token}")
        
        logger.debug(f"Service: Querying refresh token - token: {masked_token}")
        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(RefreshToken)
            .where(
                and_(
                RefreshToken.token == token,
                RefreshToken.revoked == False,
                    RefreshToken.expires_at > now
                )
            )
        )
        refresh_token = result.scalar_one_or_none()
        
        if not refresh_token:
            logger.warning(f"Service: Refresh token not found or invalid - token: {masked_token}")
            return None
        
        user_id = refresh_token.user_id
        
        logger.debug(f"Service: Refresh token found, fetching user - token: {masked_token}, user_id: {user_id}")
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        
        if not user:
            logger.warning(f"Service: User not found for refresh token - token: {masked_token}, user_id: {user_id}")
            return None
        
            logger.info(f"Service: Refresh token validated successfully - token: {masked_token}, user_id: {user.id}")
        return user
    except Exception as e:
        logger.error(f"Service: Database error validating refresh token - token: {mask_token(token)}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while validating refresh token"
        )


async def revoke_refresh_token(db: AsyncSession, token: str) -> bool:
    try:
        masked_token = mask_token(token)
        logger.info(f"Service: Revoking refresh token - token: {masked_token}")
        
        logger.debug(f"Service: Querying refresh token - token: {masked_token}")
        result = await db.execute(select(RefreshToken).where(RefreshToken.token == token))
        refresh_token = result.scalar_one_or_none()
        
        if not refresh_token:
            logger.warning(f"Service: Refresh token not found for revocation - token: {masked_token}")
            return False
        
        user_id = refresh_token.user_id
        
        logger.debug(f"Service: Refresh token found, revoking - token: {masked_token}, user_id: {user_id}")
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.token == token)
            .values(revoked=True)
        )
        await db.flush()  # Use flush() instead of commit() - let get_db() handle the commit
        
        logger.info(f"Service: Refresh token revoked successfully - token: {masked_token}, user_id: {user_id}")
        return True
    except Exception as e:
        await db.rollback()
        logger.error(f"Service: Database error revoking refresh token - token: {mask_token(token)}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while revoking refresh token"
        )


async def revoke_all_user_tokens(db: AsyncSession, user_id: int) -> None:
    try:
        logger.info(f"Service: Revoking all tokens for user - user_id: {user_id}")
        
        logger.debug(f"Service: Querying all active tokens for user_id: {user_id}")
        result = await db.execute(
            select(RefreshToken)
            .where(
                and_(
                    RefreshToken.user_id == user_id,
                    RefreshToken.revoked == False
                )
            )
        )
        tokens = result.scalars().all()
        logger.debug(f"Service: Found {len(tokens)} active tokens for user_id: {user_id}")
        
        if tokens:
            await db.execute(
                update(RefreshToken)
                .where(
                    and_(
                        RefreshToken.user_id == user_id,
                        RefreshToken.revoked == False
                    )
                )
                .values(revoked=True)
            )
            await db.commit()
        
        logger.info(f"Service: Revoked {len(tokens)} tokens for user_id: {user_id}")
    except Exception as e:
        await db.rollback()
        logger.error(f"Service: Database error revoking all user tokens - user_id: {user_id}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while revoking tokens"
        )


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    try:
        masked_email = mask_email(email)
        logger.debug(f"Service: Getting user by email - email: {masked_email}")
        
        logger.debug(f"Service: Querying user by email - email: {masked_email}")
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            logger.debug(f"Service: User not found by email - email: {masked_email}")
            return None
        
        logger.debug(f"Service: User found by email - email: {masked_email}, user_id: {user.id}")
        return user
    except Exception as e:
        logger.error(f"Service: Database error getting user by email - email: {mask_email(email)}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while fetching user"
        )


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    try:
        logger.debug(f"Service: Getting user by id - user_id: {user_id}")
        
        logger.debug(f"Service: Querying user by id - user_id: {user_id}")
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            logger.debug(f"Service: User not found by id - user_id: {user_id}")
            return None
        
        logger.debug(f"Service: User found by id - user_id: {user_id}, email: {mask_email(user.email)}")
        return user
    except ValueError as e:
        logger.error(f"Service: Invalid user_id format - user_id: {user_id}, error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid user_id format: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Service: Database error getting user by id - user_id: {user_id}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while fetching user"
        )


async def create_user(db: AsyncSession, email: str, password: str) -> User:
    try:
        masked_email = mask_email(email)
        logger.info(f"Service: Creating user - email: {masked_email}")
        
        logger.debug(f"Service: Generating verification token for email: {masked_email}")
        verification_token = generate_token()
        verification_expires = datetime.now(timezone.utc) + timedelta(hours=24)
        
        logger.debug(f"Service: Hashing password for email: {masked_email}")
        hashed_pwd = hash_password(password)
        
        logger.debug(f"Service: Inserting user to database for email: {masked_email}")
        user = User(
            email=email,
            hashed_password=hashed_pwd,
            is_verified=False,
            verification_token=verification_token,
            verification_token_expires=verification_expires,
            reset_token=None,
            reset_token_expires=None
        )
        db.add(user)
        await db.flush()  # Use flush() instead of commit() - let get_db() handle the commit
        await db.refresh(user)
        
        logger.info(f"Service: User created successfully - user_id: {user.id}, email: {masked_email}")
        return user
    except Exception as e:
        await db.rollback()
        logger.error(f"Service: Database error creating user - email: {mask_email(email)}, error: {str(e)}", exc_info=True)
        error_str = str(e).lower()
        if "duplicate" in error_str or "unique" in error_str or "already exists" in error_str:
            raise HTTPException(
                status_code=409,
                detail="User with this email already exists"
            )
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while creating user"
        )
    except ValueError as e:
        await db.rollback()
        logger.error(f"Service: Invalid input creating user - email: {mask_email(email)}, error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid input: {str(e)}"
        )


async def verify_user_email(db: AsyncSession, token: str) -> Optional[User]:
    try:
        masked_token = mask_token(token)
        logger.info(f"Service: Verifying user email - token: {masked_token}")
        
        logger.debug(f"Service: Querying user by verification token - token: {masked_token}")
        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(User)
            .where(
                and_(
                User.verification_token == token,
                    User.verification_token_expires > now
                )
            )
        )
        user = result.scalar_one_or_none()
        
        if not user:
            logger.warning(f"Service: Invalid or expired verification token - token: {masked_token}")
            return None
        
        logger.debug(f"Service: User found, verifying email - token: {masked_token}, user_id: {user.id}, email: {mask_email(user.email)}")
        user.is_verified = True
        user.verification_token = None
        user.verification_token_expires = None
        await db.flush()  # Use flush() instead of commit() - let get_db() handle the commit
        await db.refresh(user)
        
        logger.info(f"Service: Email verified successfully - user_id: {user.id}, email: {mask_email(user.email)}")
        return user
    except ValueError as e:
        logger.error(f"Service: Invalid token format - token: {mask_token(token)}, error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid token format: {str(e)}"
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Service: Database error verifying user email - token: {mask_token(token)}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while verifying email"
        )


async def create_password_reset_token(db: AsyncSession, user: User) -> str:
    try:
        masked_email = mask_email(user.email)
        logger.info(f"Service: Creating password reset token - user_id: {user.id}, email: {masked_email}")
        
        logger.debug(f"Service: Generating password reset token for user_id: {user.id}")
        token = generate_token()
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        
        logger.debug(f"Service: Updating user with reset token - user_id: {user.id}, email: {masked_email}")
        user.reset_token = token
        user.reset_token_expires = expires_at
        await db.flush()  # Use flush() instead of commit() - let get_db() handle the commit
        await db.refresh(user)
        
        logger.info(f"Service: Password reset token created successfully - user_id: {user.id}, email: {masked_email}, token: {mask_token(token)}")
        return token
    except Exception as e:
        await db.rollback()
        logger.error(f"Service: Database error creating password reset token - user_id: {user.id}, email: {mask_email(user.email)}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while creating password reset token"
        )


async def reset_user_password(db: AsyncSession, token: str, new_password: str) -> Optional[User]:
    try:
        masked_token = mask_token(token)
        logger.info(f"Service: Resetting user password - token: {masked_token}")
        
        logger.debug(f"Service: Querying user by reset token - token: {masked_token}")
        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(User)
            .where(
                and_(
                User.reset_token == token,
                    User.reset_token_expires > now
                )
            )
        )
        user = result.scalar_one_or_none()
        
        if not user:
            logger.warning(f"Service: Invalid or expired reset token - token: {masked_token}")
            return None
        
        masked_email = mask_email(user.email)
    
        logger.debug(f"Service: User found, resetting password - token: {masked_token}, user_id: {user.id}, email: {masked_email}")
        
        logger.debug(f"Service: Hashing new password for user_id: {user.id}")
        hashed_pwd = hash_password(new_password)
            
        logger.debug(f"Service: Revoking all user tokens for user_id: {user.id}")
        await revoke_all_user_tokens(db, user.id)
        
        logger.debug(f"Service: Updating user password - user_id: {user.id}")
        user.hashed_password = hashed_pwd
        user.reset_token = None
        user.reset_token_expires = None
        await db.flush()  # Use flush() instead of commit() - let get_db() handle the commit
        await db.refresh(user)
            
        logger.info(f"Service: Password reset successfully - user_id: {user.id}, email: {masked_email}")
        return user
    except ValueError as e:
        logger.error(f"Service: Invalid token format or password - token: {mask_token(token)}, error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid input: {str(e)}"
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Service: Database error resetting user password - token: {mask_token(token)}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while resetting password"
        )

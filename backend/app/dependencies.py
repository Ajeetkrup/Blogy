from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose.exceptions import JWTError
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.auth import decode_access_token, get_user_by_id
from app.models.user import User
from app.database import get_db
from app.utils.logger import logger
from app.utils.mask import mask_email, mask_token

security = HTTPBearer(auto_error=False)
ACCESS_TOKEN_COOKIE = "access_token"


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    access_token: Optional[str] = Cookie(None, alias=ACCESS_TOKEN_COOKIE),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> User:
    try:
        # Try to get token from cookie first (preferred method)
        token = access_token
        
        # Fall back to Authorization header for backward compatibility
        if not token and credentials:
            token = credentials.credentials
        
        if not token:
            logger.warning(f"Dependency: Authentication failed - no token provided")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        masked_token = mask_token(token)
        logger.info(f"Dependency: Authentication attempt - token: {masked_token}")
        
        logger.debug(f"Dependency: Decoding access token - token: {masked_token}")
        user_id = decode_access_token(token)
        
        if user_id is None:
            logger.warning(f"Dependency: Authentication failed - invalid or expired token: {masked_token}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.debug(f"Dependency: Token decoded successfully - user_id: {user_id}, token: {masked_token}")
        logger.debug(f"Dependency: Fetching user from database - user_id: {user_id}")
        
        user = await get_user_by_id(db, user_id)
        
        if user is None:
            logger.warning(f"Dependency: Authentication failed - user not found: user_id: {user_id}, token: {masked_token}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.info(f"Dependency: Authentication successful - user_id: {user.id}, email: {mask_email(user.email)}, token: {masked_token}")
        return user
    except HTTPException:
        raise
    except JWTError as e:
        logger.error(f"Dependency: JWT error during authentication - token: {mask_token(credentials.credentials if credentials else 'none')}, error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Dependency: Database error during authentication - user_id: {user_id if 'user_id' in locals() else 'unknown'}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred during authentication"
        )
    except ValueError as e:
        logger.error(f"Dependency: Invalid token format - token: {mask_token(credentials.credentials if credentials else 'none')}, error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Dependency: Unexpected error during authentication - token: {mask_token(credentials.credentials if credentials else 'none')}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during authentication"
        )


async def get_current_user_id(
    access_token: Optional[str] = Cookie(None, alias=ACCESS_TOKEN_COOKIE),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> int:
    try:
        # Try to get token from cookie first (preferred method)
        token = access_token
        
        # Fall back to Authorization header for backward compatibility
        if not token and credentials:
            token = credentials.credentials
        
        if not token:
            logger.warning(f"Dependency: Failed to get user_id - no token provided")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        masked_token = mask_token(token)
        logger.info(f"Dependency: Getting user_id from token - token: {masked_token}")
        
        logger.debug(f"Dependency: Decoding access token - token: {masked_token}")
        user_id = decode_access_token(token)
        
        if user_id is None:
            logger.warning(f"Dependency: Failed to get user_id - invalid or expired token: {masked_token}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.debug(f"Dependency: User_id extracted successfully - user_id: {user_id}, token: {masked_token}")
        return user_id
    except HTTPException:
        raise
    except JWTError as e:
        logger.error(f"Dependency: JWT error getting user_id - token: {mask_token(credentials.credentials)}, error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except ValueError as e:
        logger.error(f"Dependency: Invalid token format getting user_id - token: {mask_token(credentials.credentials)}, error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Dependency: Unexpected error getting user_id - token: {mask_token(credentials.credentials)}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during authentication"
        )
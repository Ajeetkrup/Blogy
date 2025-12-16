"""
Rate limiting configuration using slowapi.
Prevents aggressive scraping and API abuse.
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from app.utils.logger import logger

# Create rate limiter instance
# Uses IP address for rate limiting
limiter = Limiter(key_func=get_remote_address)

# Rate limit configurations
# Format: "number of requests / time period"
# Examples:
# - "100/hour" = 100 requests per hour
# - "30/minute" = 30 requests per minute
# - "10/second" = 10 requests per second

# General API rate limits (more lenient for legitimate users)
GENERAL_RATE_LIMIT = "100/hour"  # 100 requests per hour per IP
GENERAL_RATE_LIMIT_PER_MINUTE = "30/minute"  # 30 requests per minute per IP

# Stricter limits for blog endpoints (to prevent scraping)
BLOG_RATE_LIMIT = "60/hour"  # 60 requests per hour per IP for blog content
BLOG_RATE_LIMIT_PER_MINUTE = "20/minute"  # 20 requests per minute per IP

# Even stricter for blog listing endpoints (most likely to be scraped)
BLOG_LIST_RATE_LIMIT = "30/hour"  # 30 requests per hour per IP
BLOG_LIST_RATE_LIMIT_PER_MINUTE = "10/minute"  # 10 requests per minute per IP

# Auth endpoints (more lenient to allow legitimate login attempts)
AUTH_RATE_LIMIT = "20/minute"  # 20 requests per minute per IP (prevents brute force)
AUTH_RATE_LIMIT_PER_HOUR = "100/hour"  # 100 requests per hour per IP

# Health check endpoint (very lenient)
HEALTH_RATE_LIMIT = "300/hour"  # 300 requests per hour per IP


def get_rate_limit_key(request: Request) -> str:
    """
    Custom key function for rate limiting.
    Uses IP address as the primary identifier.
    
    Args:
        request: FastAPI request object
        
    Returns:
        String identifier for rate limiting (IP address)
    """
    # Get client IP address
    # Check for forwarded IP (when behind proxy/load balancer)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Take the first IP if multiple are present
        ip = forwarded_for.split(",")[0].strip()
    else:
        # Fall back to direct client IP
        ip = request.client.host if request.client else "unknown"
    
    return ip


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """
    Custom handler for rate limit exceeded errors.
    Logs the attempt and returns a user-friendly error message.
    
    Args:
        request: FastAPI request object
        exc: RateLimitExceeded exception
        
    Returns:
        JSONResponse with error details
    """
    from fastapi.responses import JSONResponse
    from fastapi import status
    
    # Log the rate limit violation
    client_ip = get_rate_limit_key(request)
    logger.warning(
        f"Rate limit exceeded - IP: {client_ip}, "
        f"Path: {request.url.path}, "
        f"Method: {request.method}, "
        f"Limit: {exc.detail}"
    )
    
    # Return user-friendly error response
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "error": "Rate limit exceeded",
            "message": "Too many requests from this IP address. Please try again later.",
            "retry_after": exc.retry_after if hasattr(exc, 'retry_after') else None
        },
        headers={
            "Retry-After": str(exc.retry_after) if hasattr(exc, 'retry_after') else "60",
            "X-RateLimit-Limit": str(exc.detail) if hasattr(exc, 'detail') else "unknown",
        }
    )

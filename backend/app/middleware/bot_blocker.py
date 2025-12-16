"""
Middleware to block AI crawlers and bots from accessing the API.
"""
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.utils.logger import logger

# Known AI bot user-agent patterns
AI_BOT_PATTERNS = [
    r'GPTBot',
    r'ChatGPT-User',
    r'ClaudeBot',
    r'anthropic-ai',
    r'Google-Extended',
    r'PerplexityBot',
    r'CCBot',
    r'Amazonbot',
    r'cohere-ai',
    r'ai-crawler',
    r'ai-bot',
    r'bot.*ai',
    r'crawler.*ai',
]

import re

def is_ai_bot(user_agent: str) -> bool:
    """
    Check if the user agent string matches any known AI bot pattern.
    
    Args:
        user_agent: The User-Agent header value
        
    Returns:
        True if the user agent matches an AI bot pattern, False otherwise
    """
    if not user_agent:
        return False
    
    user_agent_lower = user_agent.lower()
    for pattern in AI_BOT_PATTERNS:
        if re.search(pattern, user_agent_lower, re.IGNORECASE):
            return True
    return False


class BotBlockerMiddleware(BaseHTTPMiddleware):
    """
    Middleware that blocks requests from known AI crawlers and bots.
    """
    
    async def dispatch(self, request: Request, call_next):
        user_agent = request.headers.get('user-agent', '')
        
        # Check if the request is from an AI bot
        if is_ai_bot(user_agent):
            # Log the blocked attempt
            logger.warning(
                f"Blocked AI bot access: {user_agent} - {request.method} {request.url.path} - "
                f"IP: {request.client.host if request.client else 'unknown'}"
            )
            
            # Return 403 Forbidden
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={
                    "error": "Automated access detected",
                    "message": "AI crawlers are not permitted to access this API"
                }
            )
        
        # Allow the request to proceed
        response = await call_next(request)
        return response

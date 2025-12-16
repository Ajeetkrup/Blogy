from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, blog
from app.config import get_settings
from app.utils.logger import logger
from app.middleware.bot_blocker import BotBlockerMiddleware
from app.middleware.rate_limiter import limiter, rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

settings = get_settings()


app = FastAPI(title="Blogy API", version="1.0.0")

# Initialize rate limiter
app.state.limiter = limiter

# Add custom rate limit exceeded handler
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Add bot blocker middleware first (before CORS and rate limiting)
app.add_middleware(BotBlockerMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(blog.router, prefix="/blog", tags=["Blogs"])

@app.get("/health")
@limiter.limit("300/hour")
async def health_check(request: Request):
    logger.debug("This is a debug message 2")
    return {"status": "healthy"}


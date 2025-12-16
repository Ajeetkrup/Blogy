from pydantic import BaseModel, Field, field_validator
from typing import Dict, List, Optional, Any
from datetime import datetime

class CreateBlogRequest(BaseModel):
    title: str
    content: Dict
    sources: List[str] = Field(..., min_length=1, description="At least one source is required")
    status: str
    
    @field_validator('sources')
    @classmethod
    def validate_sources(cls, v: List[str]) -> List[str]:
        if not v or len(v) == 0:
            raise ValueError('At least one source is required')
        # Filter out empty strings
        filtered = [s.strip() for s in v if s.strip()]
        if len(filtered) == 0:
            raise ValueError('At least one non-empty source is required')
        return filtered

class CreateBlogResponse(BaseModel):
    id: int
    title: str
    slug: str
    user_id: int
    content: Dict
    sources: List[str]
    status: str

class BlogItem(BaseModel):
    id: int
    title: str
    slug: str
    content: Dict
    sources: List[str]
    views: int = 0
    status: str = "draft"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class GetAllBlogsResponse(BaseModel):
    blogs: List[BlogItem]

class BlogResponse(BaseModel):
    message: str

class BlogAnalytics(BaseModel):
    total_blogs: int
    published_count: int
    draft_count: int
    total_views: int
    most_viewed_blog: Optional[BlogItem] = None
    blogs: List[BlogItem]
    views_over_time: List[Dict[str, Any]]

class MyBlogsResponse(BaseModel):
    blogs: List[BlogItem]
    total: int
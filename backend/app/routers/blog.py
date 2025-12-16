from app.services.blog import create_blog, update_blog, get_blog, get_blog_slug, get_all_blogs, get_all_blogs_per_user, delete_blog, increment_blog_views, get_user_blogs, get_user_blog_analytics
from app.schemas.blog import CreateBlogRequest, CreateBlogResponse, GetAllBlogsResponse, BlogResponse, MyBlogsResponse, BlogAnalytics
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_current_user_id
from app.database import get_db
from app.models.user import User
from app.utils.logger import logger
from pydantic import ValidationError
from typing import Optional
from app.middleware.rate_limiter import (
    limiter,
    BLOG_RATE_LIMIT,
    BLOG_RATE_LIMIT_PER_MINUTE,
    BLOG_LIST_RATE_LIMIT,
    BLOG_LIST_RATE_LIMIT_PER_MINUTE
)

router = APIRouter()

@router.post("/create-blog", response_model=CreateBlogResponse)
async def create_blog_endpoint(
    data: CreateBlogRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    try:
        logger.info(f"Creating blog - user_id: {current_user_id}, title: '{data.title}'")
        blog = await create_blog(db, data, current_user_id)
        logger.info(f"Blog created successfully - blog_id: {blog.id}, title: '{blog.title}'")
        return blog
    except HTTPException as e:
        logger.warning(f"Blog creation failed with HTTP exception - user_id: {current_user_id}, title: '{data.title}', status: {e.status_code}, detail: {e.detail}")
        raise
    except ValidationError as e:
        logger.error(f"Validation error creating blog - user_id: {current_user_id}, title: '{data.title}', errors: {e.errors()}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Database error creating blog - user_id: {current_user_id}, title: '{data.title}', error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while creating the blog. Please try again later."
        )

@router.post("/update-blog", response_model=CreateBlogResponse)
async def update_blog_endpoint(
    data: CreateBlogResponse,
    db: AsyncSession = Depends(get_db)
):
    try:
        logger.info(f"Updating blog - blog_id: {data.id}, title: '{data.title}'")
        blog = await update_blog(db, data)
        logger.info(f"Blog updated successfully - blog_id: {blog.id}, title: '{blog.title}'")
        return blog
    except HTTPException as e:
        logger.warning(f"Blog update failed with HTTP exception - blog_id: {data.id}, status: {e.status_code}, detail: {e.detail}")
        raise
    except ValidationError as e:
        logger.error(f"Validation error updating blog - blog_id: {data.id}, errors: {e.errors()}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Database error updating blog - blog_id: {data.id}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while updating the blog. Please try again later."
        )

@router.post("/get_blog/{blog_id}", response_model=CreateBlogResponse)
@limiter.limit(BLOG_RATE_LIMIT)
@limiter.limit(BLOG_RATE_LIMIT_PER_MINUTE)
async def get_blog_by_id(
    request: Request,
    blog_id: int,
    db: AsyncSession = Depends(get_db)
):
    try:
        logger.info(f"Getting blog by id - blog_id: {blog_id}")
        blog = await get_blog(db, blog_id)
        logger.info(f"Blog fetched successfully - blog_id: {blog.id}, title: '{blog.title}'")
        return blog
    except HTTPException as e:
        logger.warning(f"Blog not found - blog_id: {blog_id}, status: {e.status_code}")
        raise
    except ValueError as e:
        logger.error(f"Invalid blog_id format - blog_id: {blog_id}, error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid blog_id format: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Database error getting blog - blog_id: {blog_id}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while fetching the blog. Please try again later."
        )

@router.post("/get_blog_by_slug/{slug}", response_model=CreateBlogResponse)
@limiter.limit(BLOG_RATE_LIMIT)
@limiter.limit(BLOG_RATE_LIMIT_PER_MINUTE)
async def get_blog_by_slug(
    request: Request,
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        logger.info(f"Getting blog by slug - slug: '{slug}'")
        blog = await get_blog_slug(db, slug)
        logger.info(f"Blog fetched successfully - blog_id: {blog.id}, slug: '{blog.slug}', title: '{blog.title}'")
        return blog
    except HTTPException as e:
        logger.warning(f"Blog not found by slug - slug: '{slug}', status: {e.status_code}")
        raise
    except Exception as e:
        logger.error(f"Database error getting blog by slug - slug: '{slug}', error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while fetching the blog. Please try again later."
        )

@router.post("/get_all_blogs", response_model=GetAllBlogsResponse)
@limiter.limit(BLOG_LIST_RATE_LIMIT)
@limiter.limit(BLOG_LIST_RATE_LIMIT_PER_MINUTE)
async def get_all_blogs_endpoint(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    try:
        logger.info(f"Router: Getting all blogs from platform - requested by user_id: {current_user_id}")
        blogs = await get_all_blogs(db)
        logger.info(f"Router: Retrieved {len(blogs)} blogs from platform - requested by user_id: {current_user_id}")
        return {'blogs': blogs}
    except Exception as e:
        logger.error(f"Router: Database error getting all blogs - requested by user_id: {current_user_id}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while fetching blogs. Please try again later."
        )

@router.post("/delete_blog/{blog_id}", response_model=BlogResponse)
async def delete_blog_by_id(
    blog_id: int,
    db: AsyncSession = Depends(get_db)
):
    try:
        logger.info(f"Deleting blog - blog_id: {blog_id}")
        isDeleted = await delete_blog(db, blog_id)

        if isDeleted == False:
            logger.warning(f"Blog not found for deletion - blog_id: {blog_id}")
            return {'message': 'Blog not found'}

        logger.info(f"Blog deleted successfully - blog_id: {blog_id}")
        return {'message': 'Blog deleted successfully'}
    except ValueError as e:
        logger.error(f"Invalid blog_id format - blog_id: {blog_id}, error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid blog_id format: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Database error deleting blog - blog_id: {blog_id}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while deleting the blog. Please try again later."
        )

@router.post("/create-sample-blogs", response_model=dict)
async def create_sample_blogs_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Create 10 sample blogs for testing"""
    blog_titles = [
        "My 455 First Blog Post - Getting Started with Blogging",
        "Understanding Python Async Programming - A Deep Dive",
        "Building RESTful APIs with FastAPI - Complete Guide",
        "Database Design Best Practices for Modern Applications",
        "Frontend Development with React and TypeScript",
        "Docker and Containerization - Getting Started",
        "CI/CD Pipelines - Automating Your Deployment",
        "Microservices Architecture - Patterns and Practices",
        "GraphQL vs REST - Choosing the Right API Style",
        "Security Best Practices for Web Applications"
    ]
    
    sample_content = {
        "blocks": [
            {
                "data": {"text": "Welcome to My Blog", "level": 1},
                "type": "header"
            },
            {
                "data": {"text": "This is my first blog post! I'm excited to share my thoughts and experiences with you."},
                "type": "paragraph"
            },
            {
                "data": {"text": "Why I Started Blogging", "level": 2},
                "type": "header"
            },
            {
                "data": {"text": "Blogging is a great way to express yourself and connect with others who share similar interests."},
                "type": "paragraph"
            },
            {
                "data": {
                    "items": [
                        "Share knowledge and experiences",
                        "Connect with like-minded people",
                        "Improve writing skills",
                        "Build an online presence"
                    ],
                    "style": "unordered"
                },
                "type": "list"
            },
            {
                "data": {"text": "What's Next", "level": 2},
                "type": "header"
            },
            {
                "data": {"text": "I plan to write regularly about technology, coding, and my learning journey. Stay tuned for more posts!"},
                "type": "paragraph"
            }
        ]
    }
    
    created_blogs = []
    failed_blogs = []
    
    try:
        logger.info(f"Starting bulk blog creation - user_id: {current_user_id}, total blogs: {len(blog_titles)}")
        
        for title in blog_titles:
            try:
                blog_data = CreateBlogRequest(
                    title=title,
                    content=sample_content,
                    status="published"
                )
                blog = await create_blog(db, blog_data, current_user_id)
                created_blogs.append({
                    "id": blog.id,
                    "title": blog.title,
                    "slug": blog.slug
                })
                logger.info(f"Successfully created blog - blog_id: {blog.id}, title: '{title}'")
            except HTTPException as e:
                failed_blogs.append({"title": title, "error": e.detail, "status_code": e.status_code})
                logger.warning(f"HTTP exception creating blog - title: '{title}', status: {e.status_code}, detail: {e.detail}")
            except Exception as e:
                error_str = str(e).lower()
                if "duplicate" in error_str or "unique" in error_str:
                    failed_blogs.append({"title": title, "error": "Blog with this title already exists", "status_code": 409})
                    logger.warning(f"Integrity error creating blog - title: '{title}', error: Duplicate title")
                else:
                    failed_blogs.append({"title": title, "error": "Database error occurred", "status_code": 500})
                    logger.error(f"Database error creating blog - title: '{title}', error: {str(e)}", exc_info=True)
            except ValidationError as e:
                failed_blogs.append({"title": title, "error": f"Validation error: {str(e)}", "status_code": 422})
                logger.error(f"Validation error creating blog - title: '{title}', errors: {e.errors()}")
        
        logger.info(f"Bulk blog creation completed - user_id: {current_user_id}, created: {len(created_blogs)}, failed: {len(failed_blogs)}")
        
        return {
            "message": f"Created {len(created_blogs)} out of {len(blog_titles)} sample blogs",
            "created_count": len(created_blogs),
            "failed_count": len(failed_blogs),
            "blogs": created_blogs,
            "failed": failed_blogs if failed_blogs else None
        }
    except Exception as e:
        logger.error(f"Database error in bulk blog creation - user_id: {current_user_id}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while creating sample blogs. Please try again later."
        )

@router.get("/my-blogs", response_model=MyBlogsResponse)
async def get_my_blogs(
    db: AsyncSession = Depends(get_db),
    status: Optional[str] = Query(None, description="Filter by status: published or draft"),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get current user's blogs with optional status filter."""
    try:
        logger.info(f"Router: Getting user blogs - user_id: {current_user_id}, status_filter: {status}")
        blogs = await get_user_blogs(db, current_user_id, status_filter=status)
        logger.info(f"Router: Retrieved {len(blogs)} blogs for user_id: {current_user_id}")
        return {'blogs': blogs, 'total': len(blogs)}
    except HTTPException as e:
        raise
    except Exception as e:
        logger.error(f"Router: Database error getting user blogs - user_id: {current_user_id}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while fetching blogs. Please try again later."
        )

@router.post("/increment-views/{blog_id}")
async def increment_views(
    blog_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Increment blog view count. Public endpoint, no auth required."""
    try:
        logger.info(f"Router: Incrementing views for blog - blog_id: {blog_id}")
        success = await increment_blog_views(db, blog_id)
        if not success:
            raise HTTPException(status_code=404, detail="Blog not found")
        logger.info(f"Router: Views incremented successfully - blog_id: {blog_id}")
        return {'message': 'Views incremented successfully'}
    except HTTPException as e:
        raise
    except Exception as e:
        logger.error(f"Router: Database error incrementing views - blog_id: {blog_id}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while incrementing views. Please try again later."
        )

@router.get("/analytics", response_model=BlogAnalytics)
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get comprehensive analytics for current user's blogs."""
    try:
        logger.info(f"Router: Getting analytics - user_id: {current_user_id}")
        analytics = await get_user_blog_analytics(db, current_user_id)
        logger.info(f"Router: Analytics retrieved - user_id: {current_user_id}, total_blogs: {analytics.total_blogs}")
        return analytics
    except HTTPException as e:
        raise
    except Exception as e:
        logger.error(f"Router: Database error getting analytics - user_id: {current_user_id}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while fetching analytics. Please try again later."
        )

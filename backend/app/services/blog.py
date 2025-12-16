from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, func, desc
from sqlalchemy.orm import selectinload
from app.models.blog import Blog
from app.schemas.blog import CreateBlogRequest, CreateBlogResponse, BlogItem, BlogAnalytics
from typing import Optional, List
from fastapi import HTTPException
from app.utils.logger import logger
from datetime import datetime, timedelta

def slugify(title: str) -> str:
    return title.lower().replace(" ", "-")

async def create_blog(db: AsyncSession, data: CreateBlogRequest, user_id: int) -> Blog:
    try:
        logger.info(f"Service: Creating blog - user_id: {user_id}, title: '{data.title}', status: '{data.status}'")
        
        logger.debug(f"Service: Generating slug for title: '{data.title}'")
        slug = slugify(data.title)
        logger.debug(f"Service: Generated slug: '{slug}'")
        
        logger.debug(f"Service: Inserting blog to database - title: '{data.title}', slug: '{slug}', user_id: {user_id}")
        blog = Blog(
            title=data.title,
            slug=slug,
            user_id=user_id,
            content=data.content,
            sources=data.sources,
            status=data.status,
            views=0
        )
        db.add(blog)
        await db.flush()  # Use flush() instead of commit() - let get_db() handle the commit
        await db.refresh(blog)
        
        logger.info(f"Service: Blog created successfully - blog_id: {blog.id}, title: '{blog.title}', slug: '{blog.slug}'")
        return blog
    except Exception as e:
        await db.rollback()
        logger.error(f"Service: Database error creating blog - user_id: {user_id}, title: '{data.title}', error: {str(e)}", exc_info=True)
        error_str = str(e).lower()
        if "duplicate" in error_str or "unique" in error_str or "already exists" in error_str:
            raise HTTPException(
                status_code=409,
                detail="Blog with this title already exists or constraint violation occurred"
            )
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while creating blog"
        )
    except ValueError as e:
        await db.rollback()
        logger.error(f"Service: Invalid input data creating blog - user_id: {user_id}, title: '{data.title}', error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid input data: {str(e)}"
        )

async def update_blog(db: AsyncSession, data: CreateBlogResponse) -> Blog:
    try:
        logger.info(f"Service: Updating blog - blog_id: {data.id}, title: '{data.title}'")
        
        logger.debug(f"Service: Checking if blog exists - blog_id: {data.id}")
        result = await db.execute(select(Blog).where(Blog.id == data.id))
        blog = result.scalar_one_or_none()

        if not blog:
            logger.warning(f"Service: Blog not found for update - blog_id: {data.id}")
            raise HTTPException(status_code=404, detail="Blog not found")

        logger.debug(f"Service: Updating blog - blog_id: {data.id}")
        blog.title = data.title
        blog.slug = data.slug
        blog.user_id = data.user_id
        blog.content = data.content
        blog.sources = data.sources
        blog.status = data.status
        await db.commit()
        await db.refresh(blog)
        
        logger.info(f"Service: Blog updated successfully - blog_id: {blog.id}, title: '{blog.title}'")
        return blog
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Service: Database error updating blog - blog_id: {data.id}, error: {str(e)}", exc_info=True)
        error_str = str(e).lower()
        if "duplicate" in error_str or "unique" in error_str:
            raise HTTPException(
                status_code=409,
                detail="Constraint violation occurred while updating blog"
            )
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while updating blog"
        )
    except ValueError as e:
        await db.rollback()
        logger.error(f"Service: Invalid input data updating blog - blog_id: {data.id}, error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid input data: {str(e)}"
        )

async def get_blog(db: AsyncSession, blog_id: int) -> Blog:
    try:
        logger.info(f"Service: Getting blog by id - blog_id: {blog_id}")
        
        logger.debug(f"Service: Querying blog by id - blog_id: {blog_id}")
        result = await db.execute(select(Blog).where(Blog.id == blog_id))
        blog = result.scalar_one_or_none()

        if not blog:
            logger.warning(f"Service: Blog not found - blog_id: {blog_id}")
            raise HTTPException(status_code=404, detail="Blog not found")

        logger.info(f"Service: Blog retrieved successfully - blog_id: {blog.id}, title: '{blog.title}', slug: '{blog.slug}'")
        return blog
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Service: Invalid blog_id format - blog_id: {blog_id}, error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid blog_id format: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Service: Database error getting blog - blog_id: {blog_id}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while fetching blog"
        )

async def get_blog_slug(db: AsyncSession, slug: str) -> Blog:
    try:
        logger.info(f"Service: Getting blog by slug - slug: '{slug}'")
        
        logger.debug(f"Service: Querying blog by slug - slug: '{slug}'")
        result = await db.execute(select(Blog).where(Blog.slug == slug))
        blog = result.scalar_one_or_none()

        if not blog:
            logger.warning(f"Service: Blog not found by slug - slug: '{slug}'")
            raise HTTPException(status_code=404, detail="Blog not found")

        logger.info(f"Service: Blog retrieved successfully by slug - blog_id: {blog.id}, slug: '{blog.slug}', title: '{blog.title}'")
        return blog
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Service: Database error getting blog by slug - slug: '{slug}', error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while fetching blog"
        )

async def get_all_blogs(db: AsyncSession) -> List[BlogItem]:
    try:
        logger.info(f"Service: Getting all blogs from platform")
        
        logger.debug(f"Service: Querying all blogs")
        result = await db.execute(select(Blog))
        blogs = result.scalars().all()
        
        if not blogs:
            logger.info(f"Service: No blogs found in platform")
            return []
        
        blog_items = [
            BlogItem(
                id=blog.id,
                title=blog.title,
                slug=blog.slug,
                content=blog.content,
                sources=blog.sources
            )
            for blog in blogs
        ]
        
        logger.info(f"Service: Retrieved {len(blog_items)} blogs from platform")
        return blog_items
    except Exception as e:
        logger.error(f"Service: Database error getting all blogs - error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while fetching blogs"
        )

async def get_all_blogs_per_user(db: AsyncSession, user_id: int) -> List[BlogItem]:
    try:
        logger.info(f"Service: Getting all blogs for user - user_id: {user_id}")
        
        logger.debug(f"Service: Querying blogs for user_id: {user_id}")
        result = await db.execute(select(Blog).where(Blog.user_id == user_id))
        blogs = result.scalars().all()
        
        if not blogs:
            logger.info(f"Service: No blogs found for user_id: {user_id}")
            return []
        
        blog_items = [
            BlogItem(
                id=blog.id,
                title=blog.title,
                slug=blog.slug,
                content=blog.content,
                sources=blog.sources or [],
                views=blog.views or 0,
                status=blog.status or 'draft',
                created_at=blog.created_at,
                updated_at=blog.updated_at
            )
            for blog in blogs
        ]
        
        logger.info(f"Service: Retrieved {len(blog_items)} blogs for user_id: {user_id}")
        return blog_items
    except Exception as e:
        logger.error(f"Service: Database error getting all blogs - user_id: {user_id}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while fetching blogs"
        )

async def increment_blog_views(db: AsyncSession, blog_id: int) -> bool:
    """Increment blog views count atomically."""
    try:
        logger.info(f"Service: Incrementing views for blog - blog_id: {blog_id}")
        
        result = await db.execute(select(Blog).where(Blog.id == blog_id))
        blog = result.scalar_one_or_none()
        
        if not blog:
            logger.warning(f"Service: Blog not found for view increment - blog_id: {blog_id}")
            return False
        
        blog.views = (blog.views or 0) + 1
        await db.flush()  # Use flush() instead of commit() - let get_db() handle the commit
        await db.refresh(blog)
        
        logger.info(f"Service: Views incremented successfully - blog_id: {blog_id}")
        return True
    except Exception as e:
        await db.rollback()
        logger.error(f"Service: Database error incrementing views - blog_id: {blog_id}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while incrementing views"
        )

async def get_user_blogs(db: AsyncSession, user_id: int, status_filter: Optional[str] = None) -> List[BlogItem]:
    """Get user's blogs with optional status filter."""
    try:
        logger.info(f"Service: Getting blogs for user - user_id: {user_id}, status_filter: {status_filter}")
        
        query = select(Blog).where(Blog.user_id == user_id)
        
        if status_filter and status_filter.lower() in ['published', 'draft']:
            query = query.where(Blog.status == status_filter.lower())
        
        query = query.order_by(desc(Blog.created_at))
        result = await db.execute(query)
        blogs = result.scalars().all()
        
        if not blogs:
            return []
        
        blog_items = [
            BlogItem(
                id=blog.id,
                title=blog.title,
                slug=blog.slug,
                content=blog.content,
                sources=blog.sources or [],
                views=blog.views or 0,
                status=blog.status,
                created_at=blog.created_at,
                updated_at=blog.updated_at
            )
            for blog in blogs
        ]
        
        logger.info(f"Service: Retrieved {len(blog_items)} blogs for user_id: {user_id}")
        return blog_items
    except Exception as e:
        logger.error(f"Service: Database error getting user blogs - user_id: {user_id}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while fetching blogs"
        )

async def get_user_blog_analytics(db: AsyncSession, user_id: int) -> BlogAnalytics:
    """Get comprehensive analytics for user's blogs."""
    try:
        logger.info(f"Service: Getting analytics for user - user_id: {user_id}")
        
        result = await db.execute(select(Blog).where(Blog.user_id == user_id))
        blogs_raw = result.scalars().all()
        
        blogs = [
            BlogItem(
                id=blog.id,
                title=blog.title,
                slug=blog.slug,
                content=blog.content,
                sources=blog.sources or [],
                views=blog.views or 0,
                status=blog.status,
                created_at=blog.created_at,
                updated_at=blog.updated_at
            )
            for blog in blogs_raw
        ]
        
        # Calculate statistics
        total_blogs = len(blogs)
        published_count = sum(1 for b in blogs if b.status == 'published')
        draft_count = total_blogs - published_count
        total_views = sum(b.views for b in blogs)
        
        # Find most viewed blog
        most_viewed_blog = None
        if blogs:
            most_viewed = max(blogs, key=lambda b: b.views)
            if most_viewed.views > 0:
                most_viewed_blog = most_viewed
        
        # Generate views over time (last 30 days)
        views_over_time = []
        today = datetime.now().date()
        for i in range(30):
            date = today - timedelta(days=29 - i)
            views_over_time.append({
                "date": date.isoformat(),
                "views": 0  # Placeholder - would need view history table
            })
        
        analytics = BlogAnalytics(
            total_blogs=total_blogs,
            published_count=published_count,
            draft_count=draft_count,
            total_views=total_views,
            most_viewed_blog=most_viewed_blog,
            blogs=blogs,
            views_over_time=views_over_time
        )
        
        logger.info(f"Service: Analytics retrieved - user_id: {user_id}, total_blogs: {total_blogs}, total_views: {total_views}")
        return analytics
    except Exception as e:
        logger.error(f"Service: Database error getting analytics - user_id: {user_id}, error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while fetching analytics"
        )

async def delete_blog(db: AsyncSession, blog_id: int) -> bool:
    try:
        logger.info(f"Service: Deleting blog - blog_id: {blog_id}")
        
        logger.debug(f"Service: Checking if blog exists - blog_id: {blog_id}")
        result = await db.execute(select(Blog).where(Blog.id == blog_id))
        blog = result.scalar_one_or_none()
        
        if not blog:
            logger.warning(f"Service: Blog not found for deletion - blog_id: {blog_id}")
            return False

        blog_title = blog.title
        
        logger.debug(f"Service: Blog found, deleting - blog_id: {blog_id}, title: '{blog_title}'")
        await db.delete(blog)  # Mark object for deletion
        await db.flush()  # Use flush() instead of commit() - let get_db() handle the commit
        
        logger.info(f"Service: Blog deleted successfully - blog_id: {blog_id}, title: '{blog_title}'")
        return True
    except Exception as e:
        await db.rollback()
        logger.error(f"Service: Database error deleting blog - blog_id: {blog_id}, error: {str(e)}", exc_info=True)
        error_str = str(e).lower()
        if "foreign key" in error_str or "constraint" in error_str:
            raise HTTPException(
                status_code=409,
                detail="Cannot delete blog due to foreign key constraints"
                )
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while deleting blog"
        )
    except ValueError as e:
        await db.rollback()
        logger.error(f"Service: Invalid blog_id format - blog_id: {blog_id}, error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid blog_id format: {str(e)}"
        )
    
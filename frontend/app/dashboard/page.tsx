"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import BlogCard from '@/components/BlogCard';
import { BlogCardSkeleton } from '@/components/SkeletonLoader';
import { getAllBlogs, deleteBlog, BlogItem } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import PageTransition, { StaggerContainer, StaggerItem } from '@/components/animations/PageTransition';
import AnimatedButton from '@/components/animations/AnimatedButton';
import AuthGuard from '@/components/AuthGuard';

export default function Dashboard() {
  console.log('Dashboard');
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchBlogs = useCallback(async () => {
    try {
      const response = await getAllBlogs();
      setBlogs(response.blogs);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      toast.error('Failed to load blogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await deleteBlog(id);
        setBlogs(blogs.filter(blog => blog.id !== id));
        toast.success('Blog deleted successfully');
      } catch (err) {
        toast.error('Failed to delete blog');
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-serif">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <AuthGuard>
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 font-serif">
          <Navbar />

        <main className="pt-24 pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="flex items-center justify-between mb-10"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <motion.h1
                  className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0%', '100%', '0%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    backgroundSize: '200%',
                  }}
                >
                  Latest Stories
                </motion.h1>
                <p className="text-gray-600">Discover and explore amazing content</p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatedButton
                  onClick={() => router.push('/blog/create')}
                  variant="primary"
                >
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Create New Blog
                  </span>
                </AnimatedButton>
              </motion.div>
            </motion.div>

            {!loading && blogs.length === 0 ? (
              <motion.div
                className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  ✍️
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No stories yet</h3>
                <p className="text-gray-600 mb-8">Be the first to share your thoughts with the world.</p>
                <AnimatedButton
                  onClick={() => router.push('/blog/create')}
                  variant="primary"
                >
                  Write a story
                </AnimatedButton>
              </motion.div>
            ) : (
              <StaggerContainer className="space-y-4">
                {blogs.map((blog, index) => (
                  <StaggerItem key={blog.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <BlogCard
                        id={blog.id}
                        title={blog.title}
                        content={blog.content}
                        slug={blog.slug}
                        views={blog.views}
                        status={blog.status}
                        onEdit={() => router.push(`/blog/edit/${blog.id}`)}
                        onDelete={() => handleDelete(blog.id)}
                      />
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </main>
        </div>
      </PageTransition>
    </AuthGuard>
  );
}

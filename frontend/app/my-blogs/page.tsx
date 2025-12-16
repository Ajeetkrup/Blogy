'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/Navbar'
import { getMyBlogs, deleteBlog, BlogItem } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'
import { BlogCardSkeleton } from '@/components/SkeletonLoader'
import PageTransition, { StaggerContainer, StaggerItem } from '@/components/animations/PageTransition'
import AnimatedButton from '@/components/animations/AnimatedButton'
import AuthGuard from '@/components/AuthGuard'

type SortOption = 'date-newest' | 'date-oldest' | 'views-high' | 'views-low' | 'title-asc'
type StatusFilter = 'all' | 'published' | 'draft'

export default function MyBlogsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('date-newest')
  const router = useRouter()
  const { toast } = useToast()

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const status = statusFilter === 'all' ? undefined : statusFilter
      const response = await getMyBlogs(status)
      setBlogs(response.blogs)
    } catch (err) {
      console.error('Failed to fetch blogs:', err)
      toast.error('Failed to load blogs. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await deleteBlog(id)
        setBlogs(blogs.filter(blog => blog.id !== id))
        toast.success('Blog deleted successfully')
      } catch (err) {
        toast.error('Failed to delete blog')
      }
    }
  }

  const sortedBlogs = [...blogs].sort((a, b) => {
    switch (sortOption) {
      case 'date-newest':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      case 'date-oldest':
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      case 'views-high':
        return (b.views || 0) - (a.views || 0)
      case 'views-low':
        return (a.views || 0) - (b.views || 0)
      case 'title-asc':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const getStatusBadge = (status: string) => {
    const isPublished = status === 'published'
    return (
      <motion.span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          isPublished
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}
        whileHover={{ scale: 1.1 }}
      >
        {isPublished ? 'Published' : 'Draft'}
      </motion.span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-serif">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
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
                  My Blogs
                </motion.h1>
                <p className="text-gray-600">Manage and track your blog posts</p>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }}>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-md transition-all"
                >
                  <option value="all">All</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </motion.div>
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }}>
                <label htmlFor="sort-option" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort by
                </label>
                <select
                  id="sort-option"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-md transition-all"
                >
                  <option value="date-newest">Date (Newest)</option>
                  <option value="date-oldest">Date (Oldest)</option>
                  <option value="views-high">Views (High to Low)</option>
                  <option value="views-low">Views (Low to High)</option>
                  <option value="title-asc">Title (A-Z)</option>
                </select>
              </motion.div>
            </motion.div>

            <AnimatePresence mode="wait">
              {sortedBlogs.length === 0 ? (
                <motion.div
                  key="empty"
                  className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <motion.div
                    className="text-6xl mb-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  >
                    📝
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No blogs found</h3>
                  <p className="text-gray-600 mb-8">
                    {statusFilter === 'all'
                      ? "You haven't created any blogs yet."
                      : `You don't have any ${statusFilter} blogs.`}
                  </p>
                  <AnimatedButton
                    onClick={() => router.push('/blog/create')}
                    variant="primary"
                  >
                    Create a blog
                  </AnimatedButton>
                </motion.div>
              ) : (
                <motion.div
                  key="table"
                  className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Views
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Updated
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedBlogs.map((blog, index) => (
                          <motion.tr
                            key={blog.id}
                            className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-colors"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <a
                                href={`/blog/${blog.slug}`}
                                className="text-sm font-semibold text-gray-900 hover:bg-gradient-to-r hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:bg-clip-text hover:text-transparent transition-all"
                              >
                                {blog.title}
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(blog.status || 'draft')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <motion.svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-gray-400"
                                  whileHover={{ scale: 1.2 }}
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </motion.svg>
                                <span className="font-medium">{blog.views || 0}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {blog.created_at
                                ? format(new Date(blog.created_at), 'MMM dd, yyyy')
                                : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {blog.updated_at
                                ? format(new Date(blog.updated_at), 'MMM dd, yyyy')
                                : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-3">
                                <motion.button
                                  onClick={() => router.push(`/blog/edit/${blog.id}`)}
                                  className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                                  title="Edit"
                                  whileHover={{ scale: 1.2, rotate: 15 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    ></path>
                                  </svg>
                                </motion.button>
                                <motion.button
                                  onClick={() => handleDelete(blog.id)}
                                  className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                                  title="Delete"
                                  whileHover={{ scale: 1.2, rotate: -15 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    ></path>
                                  </svg>
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </PageTransition>
    </AuthGuard>
  )
}

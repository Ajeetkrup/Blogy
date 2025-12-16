'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import { getBlogAnalytics, BlogAnalytics } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'
import ViewsOverTimeChart from '@/components/charts/ViewsOverTimeChart'
import StatusDistributionChart from '@/components/charts/StatusDistributionChart'
import TopBlogsChart from '@/components/charts/TopBlogsChart'
import { BlogCardSkeleton } from '@/components/SkeletonLoader'
import StatCard from '@/components/animations/StatCard'
import PageTransition, { StaggerContainer, StaggerItem } from '@/components/animations/PageTransition'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<BlogAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const data = await getBlogAnalytics()
        setAnalytics(data)
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
        toast.error('Failed to load analytics. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-serif">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!analytics) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-serif">
          <Navbar />
          <main className="pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl border border-white/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No analytics available</h3>
                <p className="text-gray-600">Create some blogs to see analytics.</p>
              </motion.div>
            </div>
          </main>
        </div>
      </PageTransition>
    )
  }

  return (
    <AuthGuard>
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 font-serif">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h1
              className="text-4xl sm:text-5xl font-bold mb-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{
                opacity: 1,
                y: 0,
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
              Analytics Dashboard
            </motion.h1>

            {/* Summary Cards */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StaggerItem>
                <StatCard
                  title="Total Blogs"
                  value={analytics.total_blogs}
                  color="blue"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                  }
                />
              </StaggerItem>
              <StaggerItem>
                <StatCard
                  title="Published"
                  value={analytics.published_count}
                  color="green"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  }
                />
              </StaggerItem>
              <StaggerItem>
                <StatCard
                  title="Drafts"
                  value={analytics.draft_count}
                  color="yellow"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  }
                />
              </StaggerItem>
              <StaggerItem>
                <StatCard
                  title="Total Views"
                  value={analytics.total_views}
                  color="purple"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  }
                />
              </StaggerItem>
            </StaggerContainer>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <motion.div
                className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-6 shadow-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Views Over Time</h2>
                <ViewsOverTimeChart data={analytics.views_over_time} />
              </motion.div>

              <motion.div
                className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-6 shadow-xl"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Status Distribution</h2>
                <StatusDistributionChart
                  publishedCount={analytics.published_count}
                  draftCount={analytics.draft_count}
                />
              </motion.div>
            </div>

            {/* Top Blogs Chart */}
            {analytics.blogs.length > 0 && (
              <motion.div
                className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-6 shadow-xl mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Blogs by Views</h2>
                <TopBlogsChart blogs={analytics.blogs} />
              </motion.div>
            )}

            {/* Most Viewed Blog */}
            {analytics.most_viewed_blog && (
              <motion.div
                className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-6 shadow-xl mb-10"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Most Viewed Blog</h2>
                <motion.div
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex-1">
                    <Link
                      href={`/blog/${analytics.most_viewed_blog.slug}`}
                      className="text-xl font-semibold text-gray-900 hover:bg-gradient-to-r hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:bg-clip-text hover:text-transparent transition-all"
                    >
                      {analytics.most_viewed_blog.title}
                    </Link>
                    <div className="flex items-center gap-4 mt-3">
                      <motion.span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          analytics.most_viewed_blog.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {analytics.most_viewed_blog.status === 'published' ? 'Published' : 'Draft'}
                      </motion.span>
                      <div className="flex items-center gap-1 text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span className="text-sm font-medium">{analytics.most_viewed_blog.views || 0} views</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/blog/${analytics.most_viewed_blog.slug}`}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                  >
                    View →
                  </Link>
                </motion.div>
              </motion.div>
            )}

            {/* Recent Blogs Table */}
            {analytics.blogs.length > 0 && (
              <motion.div
                className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Blogs</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analytics.blogs
                        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
                        .slice(0, 10)
                        .map((blog, index) => (
                          <motion.tr
                            key={blog.id}
                            className="hover:bg-gray-50"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + index * 0.05 }}
                            whileHover={{ x: 4, backgroundColor: 'rgba(249, 250, 251, 1)' }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link
                                href={`/blog/${blog.slug}`}
                                className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                              >
                                {blog.title}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  blog.status === 'published'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {blog.status === 'published' ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <svg
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
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                {blog.views || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {blog.created_at
                                ? format(new Date(blog.created_at), 'MMM dd, yyyy')
                                : 'N/A'}
                            </td>
                          </motion.tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {analytics.blogs.length === 0 && (
              <motion.div
                className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl border border-white/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No blogs yet</h3>
                <p className="text-gray-600 mb-6">Create your first blog to see analytics.</p>
                <Link
                  href="/blog/create"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Create a blog
                </Link>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
    </AuthGuard>
  )
}

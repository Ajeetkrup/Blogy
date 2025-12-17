'use client'

import { useState, useEffect, useRef, use } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import TiptapEditor from '@/components/TiptapEditor'
import { BlogPostSkeleton } from '@/components/SkeletonLoader'
import { getBlogBySlug, incrementBlogViews } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import PageTransition, { StaggerContainer, StaggerItem } from '@/components/animations/PageTransition'
import Navbar from '@/components/Navbar'

export default function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const { toast } = useToast()
    const [blog, setBlog] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const viewTracked = useRef(false)
    const { scrollYProgress } = useScroll()
    const articleRef = useRef<HTMLElement>(null)
    
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const decodedSlug = decodeURIComponent(slug)
                const data = await getBlogBySlug(decodedSlug)
                setBlog(data)
                
                if (!viewTracked.current && data.id) {
                    viewTracked.current = true
                    try {
                        await incrementBlogViews(data.id)
                    } catch (err) {
                        console.error('Failed to track view:', err)
                    }
                }
            } catch (err: any) {
                toast.error('Failed to load blog')
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchBlog()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Navbar />
                <BlogPostSkeleton />
            </div>
        )
    }

    if (!blog) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    <Navbar />
                    <div className="text-center py-20">
                        <motion.div
                            className="text-6xl mb-4"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            📄
                        </motion.div>
                        <h2 className="text-2xl font-bold text-gray-900">Blog not found</h2>
                    </div>
                </div>
            </PageTransition>
        )
    }

    return (
        <PageTransition>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
                <Navbar />
                
                {/* Reading Progress Bar */}
                <motion.div
                    className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 z-40 origin-left"
                    style={{ scaleX: scrollYProgress }}
                />
                
                {/* Hero Section */}
                <motion.section
                    ref={articleRef}
                    className="relative pt-32 pb-20 px-4 overflow-hidden"
                    style={{ opacity, scale }}
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20"
                        animate={{
                            background: [
                                'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
                                'radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.2) 0%, transparent 50%)',
                                'radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)',
                                'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
                            ],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    
                    <div className="max-w-4xl mx-auto relative z-10">
                        <motion.h1
                            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ 
                                opacity: 1, 
                                y: 0,
                                backgroundPosition: ['0%', '100%', '0%'],
                            }}
                            transition={{
                                opacity: { duration: 0.6 },
                                y: { duration: 0.6 },
                                backgroundPosition: {
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: 'linear',
                                },
                            }}
                            style={{
                                backgroundSize: '200%',
                            }}
                        >
                            {blog.title}
                        </motion.h1>
                        
                        <motion.div
                            className="flex items-center gap-4 text-gray-600 mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            {blog.views !== undefined && (
                                <div className="flex items-center gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
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
                                    <span className="font-medium">{blog.views || 0} views</span>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </motion.section>

                {/* Content Section */}
                <article className="max-w-4xl mx-auto px-4 pb-20">
                    <motion.div
                        className="prose lg:prose-xl mx-auto bg-white/60 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/20 shadow-xl"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <TiptapEditor content={blog.content} onChange={() => { }} editable={false} />
                    </motion.div>
                    
                    {blog.sources && blog.sources.length > 0 && (
                        <motion.div
                            className="mt-12 pt-8 border-t border-gray-200"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <motion.h2
                                className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
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
                                Sources
                            </motion.h2>
                            <StaggerContainer className="space-y-3">
                                {blog.sources.map((source: string, index: number) => (
                                    <StaggerItem key={index}>
                                        <motion.li
                                            className="text-gray-700 bg-white/60 backdrop-blur-md rounded-xl p-4 border border-gray-200/50 hover:border-blue-300 transition-all"
                                            whileHover={{ x: 4, scale: 1.02 }}
                                        >
                                            {source.startsWith('http') ? (
                                                <a
                                                    href={source}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-purple-600 font-medium transition-colors flex items-center gap-2"
                                                >
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
                                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                        <polyline points="15 3 21 3 21 9"></polyline>
                                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                                    </svg>
                                                    {source}
                                                </a>
                                            ) : (
                                                <span>{source}</span>
                                            )}
                                        </motion.li>
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>
                        </motion.div>
                    )}
                </article>
            </div>
        </PageTransition>
    )
}

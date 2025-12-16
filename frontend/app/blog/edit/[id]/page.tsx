'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import TiptapEditor from '@/components/TiptapEditor'
import EditorToolbar from '@/components/EditorToolbar'
import { FormSkeleton, SpinnerLoader } from '@/components/SkeletonLoader'
import { getBlog, updateBlog } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import Navbar from '@/components/Navbar'
import PageTransition from '@/components/animations/PageTransition'
import AnimatedButton from '@/components/animations/AnimatedButton'
import AuthGuard from '@/components/AuthGuard'

export default function EditBlogPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { user, logout } = useAuthStore()
    const { toast } = useToast()
    const [title, setTitle] = useState('')
    const [contentLabel, setContentLabel] = useState('Write your content below')
    const [content, setContent] = useState<any>(null)
    const [sources, setSources] = useState<string[]>([''])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [editor, setEditor] = useState<any>(null)

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const blog = await getBlog(parseInt(params.id))
                setTitle(blog.title)
                setContent(blog.content)
                setSources(blog.sources && blog.sources.length > 0 ? blog.sources : [''])
            } catch (err: any) {
                toast.error('Failed to load blog')
            } finally {
                setFetching(false)
            }
        }

        if (params.id) {
            fetchBlog()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id])

    useEffect(() => {
        if (title || content || sources.some(s => s.trim())) {
            setSaving(true)
            const timer = setTimeout(() => {
                setSaving(false)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [title, content, sources])

    const handleSave = async (status: 'draft' | 'published') => {
        if (!title) {
            toast.error('Title is required')
            return
        }
        
        const validSources = sources.filter(s => s.trim())
        if (validSources.length === 0) {
            toast.error('At least one source is required')
            return
        }

        setLoading(true)

        try {
            await updateBlog({
                id: parseInt(params.id),
                title,
                content,
                sources: validSources,
                status,
            })
            toast.success('Blog updated successfully')
            router.push('/dashboard')
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Failed to update blog')
        } finally {
            setLoading(false)
        }
    }

    const handleSourceChange = (index: number, value: string) => {
        const newSources = [...sources]
        newSources[index] = value
        setSources(newSources)
    }

    const addSource = () => {
        setSources([...sources, ''])
    }

    const removeSource = (index: number) => {
        if (sources.length > 1) {
            const newSources = sources.filter((_, i) => i !== index)
            setSources(newSources)
        }
    }

    if (fetching) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Navbar />
                <main className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-8">
                    <FormSkeleton />
                </main>
            </div>
        )
    }

    return (
        <AuthGuard>
        <PageTransition>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
                <Navbar />

                <main className="pt-24 pb-24 max-w-4xl mx-auto px-4 sm:px-8">
                    <motion.div
                        className="space-y-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Toolbar */}
                        {editor && (
                            <motion.div
                                className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-lg"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <EditorToolbar editor={editor} />
                            </motion.div>
                        )}
                        
                        {/* Title Input */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-4xl sm:text-5xl font-serif font-bold bg-white/80 backdrop-blur-md border-2 border-transparent focus:border-blue-300 rounded-2xl px-6 py-4 text-gray-900 placeholder-gray-400 outline-none transition-all shadow-lg hover:shadow-xl"
                                placeholder="Article Title..."
                            />
                        </motion.div>

                        {/* Editor */}
                        <motion.div
                            className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <TiptapEditor 
                                content={content} 
                                onChange={setContent} 
                                showToolbar={false}
                                onEditorReady={setEditor}
                                placeholder="Write your content here..."
                            />
                        </motion.div>

                        {/* Sources Section */}
                        <motion.div
                            className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <motion.label
                                className="block text-lg font-bold text-gray-900 mb-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                Sources <span className="text-red-500">*</span>
                            </motion.label>
                            <p className="text-sm text-gray-600 mb-4">
                                Add at least one source (URL or text reference) for your blog post
                            </p>
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {sources.map((source, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex gap-3 items-start"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <motion.input
                                                type="text"
                                                value={source}
                                                onChange={(e) => handleSourceChange(index, e.target.value)}
                                                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white transition-all"
                                                placeholder={`Source ${index + 1} (URL or text reference)`}
                                                whileFocus={{ scale: 1.02 }}
                                            />
                                            {sources.length > 1 && (
                                                <motion.button
                                                    type="button"
                                                    onClick={() => removeSource(index)}
                                                    className="px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium border-2 border-red-200"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Remove
                                                </motion.button>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <motion.button
                                    type="button"
                                    onClick={addSource}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                    Add another source
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            className="flex items-center justify-end gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <motion.button
                                onClick={() => setShowPreview(!showPreview)}
                                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:border-gray-400 hover:bg-gray-50 font-medium transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {showPreview ? 'Edit' : 'Preview'}
                            </motion.button>
                            <AnimatedButton
                                onClick={() => handleSave('draft')}
                                disabled={loading}
                                variant="outline"
                            >
                                Save Draft
                            </AnimatedButton>
                            <AnimatedButton
                                onClick={() => handleSave('published')}
                                disabled={loading}
                                loading={loading}
                                variant="primary"
                            >
                                {loading ? 'Updating...' : 'Update & Publish'}
                            </AnimatedButton>
                        </motion.div>

                        {/* Saving Indicator */}
                        <AnimatePresence>
                            {saving && (
                                <motion.div
                                    className="fixed bottom-8 right-8 bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-gray-200 flex items-center gap-3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                >
                                    <motion.div
                                        className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    />
                                    <span className="text-sm text-gray-700 font-medium">Saving...</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </main>

                {/* Preview Modal */}
                <AnimatePresence>
                    {showPreview && (
                        <motion.div
                            className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-md overflow-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="max-w-4xl mx-auto py-12 px-4">
                                <motion.div
                                    className="mb-8 flex items-center justify-between"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <h1 className="text-4xl sm:text-5xl font-bold text-white">{title || 'Untitled'}</h1>
                                    <motion.button
                                        onClick={() => setShowPreview(false)}
                                        className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl border border-white/30 hover:bg-white/30 transition-all"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Close Preview
                                    </motion.button>
                                </motion.div>
                                <motion.div
                                    className="prose lg:prose-xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-12"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <TiptapEditor content={content} onChange={() => {}} editable={false} />
                                </motion.div>
                                {sources.filter(s => s.trim()).length > 0 && (
                                    <motion.div
                                        className="mt-12 pt-8 border-t border-white/20"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <h2 className="text-3xl font-bold text-white mb-6">Sources</h2>
                                        <ul className="space-y-3">
                                            {sources.filter(s => s.trim()).map((source, index) => (
                                                <motion.li
                                                    key={index}
                                                    className="text-white/90 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.5 + index * 0.1 }}
                                                >
                                                    {source.startsWith('http') ? (
                                                        <a
                                                            href={source}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-300 hover:text-blue-200 font-medium transition-colors"
                                                        >
                                                            {source}
                                                        </a>
                                                    ) : (
                                                        <span>{source}</span>
                                                    )}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
        </AuthGuard>
    )
}

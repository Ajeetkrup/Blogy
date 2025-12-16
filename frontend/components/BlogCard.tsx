'use client'

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface BlogCardProps {
    id: number;
    title: string;
    content: any; // Using any for flexibilty with block data, but ideally should be typed
    slug?: string;
    author?: string;
    date?: string;
    views?: number;
    status?: string;
}

const BlogCard: React.FC<BlogCardProps & { onEdit?: () => void; onDelete?: () => void }> = ({ id, title, content, slug, author = "Anonymous", date = "Dec 8, 2025", views, status, onEdit, onDelete }) => {

    // Helper to extract text from Editor.js blocks or raw string
    const getExcerpt = (content: any) => {
        if (typeof content === 'string') return content.substring(0, 150) + '...';
        if (content && content.content && Array.isArray(content.content)) {
            // Adapt for Tiptap JSON structure which uses 'content' instead of 'blocks' usually, but let's check both or generic
            const paragraph = content.content.find((b: any) => b.type === 'paragraph');
            if (paragraph && paragraph.content && paragraph.content[0] && paragraph.content[0].text) {
                return paragraph.content[0].text.substring(0, 150) + '...';
            }
        }
        // Fallback for older structure if any
        if (content && content.blocks && Array.isArray(content.blocks)) {
            const paragraph = content.blocks.find((b: any) => b.type === 'paragraph');
            if (paragraph && paragraph.data && paragraph.data.text) {
                return paragraph.data.text.substring(0, 150) + '...';
            }
        }
        return "No preview available.";
    };

    return (
        <motion.article
            className="group relative bg-white/80 backdrop-blur-md transition-all sm:rounded-2xl sm:p-6 p-4 border border-gray-200/50 shadow-lg hover:shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ 
                scale: 1.02,
                y: -4,
                transition: { duration: 0.2 }
            }}
            style={{
                background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1)) border-box',
            }}
        >
            <div className="flex items-center gap-2 mb-3 flex-wrap">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                    {author[0]}
                </div>
                <span className="text-sm font-medium text-gray-900">{author}</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">{date}</span>
                {status && (
                    <>
                        <span className="text-gray-300">•</span>
                        <motion.span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                status === 'published'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}
                            whileHover={{ scale: 1.1 }}
                        >
                            {status === 'published' ? 'Published' : 'Draft'}
                        </motion.span>
                    </>
                )}
                {views !== undefined && (
                    <>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
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
                            <span>{views}</span>
                        </div>
                    </>
                )}
            </div>

            <Link href={`/blog/${slug || id}`} className="block group-hover:opacity-90 transition-opacity">
                <motion.h2
                    className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 font-serif leading-tight group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all"
                    whileHover={{ x: 4 }}
                >
                    {title}
                </motion.h2>
                <motion.p
                    className="text-gray-600 leading-relaxed line-clamp-3 mb-4 font-serif"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                >
                    {getExcerpt(content)}
                </motion.p>
            </Link>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                        Technology
                    </span>
                    <span className="text-xs text-gray-500">
                        4 min read
                    </span>
                </div>
                <div className="flex items-center gap-3 z-10 relative">
                    {onEdit && (
                        <motion.button
                            onClick={(e) => { e.preventDefault(); onEdit(); }}
                            className="text-gray-400 hover:text-blue-600 p-1 rounded-lg hover:bg-blue-50"
                            title="Edit"
                            whileHover={{ scale: 1.2, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </motion.button>
                    )}
                    {onDelete && (
                        <motion.button
                            onClick={(e) => { e.preventDefault(); onDelete(); }}
                            className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50"
                            title="Delete"
                            whileHover={{ scale: 1.2, rotate: -15 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.article>
    );
};

export default BlogCard;

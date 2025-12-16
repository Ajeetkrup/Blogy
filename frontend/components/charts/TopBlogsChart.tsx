'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { BlogItem } from '@/lib/api'

interface TopBlogsChartProps {
  blogs: BlogItem[]
}

export default function TopBlogsChart({ blogs }: TopBlogsChartProps) {
  // Sort by views and take top 10
  const topBlogs = [...blogs]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10)
    .map(blog => ({
      title: blog.title.length > 20 ? blog.title.substring(0, 20) + '...' : blog.title,
      views: blog.views || 0
    }))

  if (topBlogs.length === 0) {
    return (
      <motion.div
        className="w-full h-96 flex items-center justify-center text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        No data available
      </motion.div>
    )
  }

  return (
    <motion.div
      className="w-full h-96"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={topBlogs} 
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            type="category"
            dataKey="title"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            width={90}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          <Bar 
            dataKey="views" 
            fill="url(#barGradient)"
            radius={[0, 4, 4, 0]}
            animationDuration={1000}
          />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

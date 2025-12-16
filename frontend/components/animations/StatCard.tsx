'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState, ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: number
  icon: ReactNode
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'pink'
  trend?: number
  className?: string
}

const colorClasses = {
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-green-500 to-teal-500',
  yellow: 'from-yellow-500 to-orange-500',
  purple: 'from-purple-500 to-pink-500',
  pink: 'from-pink-500 to-rose-500',
}

export default function StatCard({ title, value, icon, color, trend, className = '' }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const spring = useSpring(0, { stiffness: 50, damping: 30 })

  useEffect(() => {
    spring.set(value)
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(Math.round(latest))
    })
    return unsubscribe
  }, [value, spring])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.05,
        y: -4,
        transition: { duration: 0.2 }
      }}
      className={`
        relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-md
        border border-gray-200/50 shadow-lg p-6
        ${className}
      `}
    >
      {/* Gradient background on hover */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0`}
        whileHover={{ opacity: 0.1 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white`}
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>
          {trend !== undefined && (
            <motion.div
              className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </motion.div>
          )}
        </div>
        
        <motion.h3
          className="text-sm font-medium text-gray-600 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.h3>
        
        <motion.div
          className={`text-3xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {displayValue.toLocaleString()}
        </motion.div>
      </div>
      
      {/* Animated border gradient */}
      <motion.div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colorClasses[color]} opacity-0`}
        whileHover={{ opacity: 0.2 }}
        style={{ padding: '2px' }}
      >
        <div className="w-full h-full bg-white rounded-2xl" />
      </motion.div>
    </motion.div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { ReactNode, useState, useEffect } from 'react'

interface GradientBackgroundProps {
  children?: ReactNode
  className?: string
  variant?: 'default' | 'blue-purple' | 'orange-pink' | 'green-teal'
}

const gradients = {
  default: 'from-blue-50 via-indigo-50 to-purple-50',
  'blue-purple': 'from-blue-400 via-purple-500 to-pink-500',
  'orange-pink': 'from-orange-400 via-pink-500 to-red-500',
  'green-teal': 'from-green-400 via-teal-500 to-cyan-500',
}

export default function GradientBackground({ 
  children, 
  className = '', 
  variant = 'default' 
}: GradientBackgroundProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className={`relative min-h-screen bg-gradient-to-br ${gradients[variant]} ${className}`}>
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Floating particles - only render after mount to prevent hydration mismatch */}
      {isMounted && [...Array(6)].map((_, i) => {
        const width = typeof window !== 'undefined' ? window.innerWidth : 1000
        const height = typeof window !== 'undefined' ? window.innerHeight : 1000
        return (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full blur-sm"
          initial={{
              x: Math.random() * width,
              y: Math.random() * height,
            scale: 0,
          }}
          animate={{
              x: Math.random() * width,
              y: Math.random() * height,
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
        )
      })}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

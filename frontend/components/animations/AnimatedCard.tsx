'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  delay?: number
}

export default function AnimatedCard({ children, className = '', onClick, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.6, -0.05, 0.01, 0.99] }}
      whileHover={{ 
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 }
      }}
      className={`
        relative bg-white/80 backdrop-blur-md rounded-2xl shadow-lg
        border-2 border-transparent
        hover:shadow-2xl
        transition-all duration-300
        ${className}
      `}
      onClick={onClick}
      style={{
        backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
      }}
    >
      <motion.div
        className="rounded-2xl p-6"
        whileHover={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05), rgba(236, 72, 153, 0.05))',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

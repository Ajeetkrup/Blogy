'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, ReactNode, useRef, useEffect } from 'react'
import Input from '@/components/Input'

interface AnimatedInputProps {
  id: string
  name: string
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  label?: string
  error?: string
  icon?: ReactNode
  required?: boolean
  autoComplete?: string
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  showPasswordToggle?: boolean
  onTogglePassword?: () => void
  showPassword?: boolean
}

export default function AnimatedInput(props: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => setIsFocused(false)
    
    const container = containerRef.current
    if (container) {
      const input = container.querySelector('input')
      if (input) {
        input.addEventListener('focus', handleFocus)
        input.addEventListener('blur', handleBlur)
        return () => {
          input.removeEventListener('focus', handleFocus)
          input.removeEventListener('blur', handleBlur)
        }
      }
    }
  }, [])

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <motion.div
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <Input
          {...props}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
        />
      </motion.div>
      
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left"
            style={{ transformOrigin: 'left' }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

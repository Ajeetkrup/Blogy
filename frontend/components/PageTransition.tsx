'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTransition() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Reset progress when route changes
    setIsLoading(true)
    setProgress(0)

    // Simulate progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        // Increment progress with decreasing speed for smooth effect
        const increment = Math.max(0.5, (100 - prev) * 0.1)
        return prev + increment
      })
    }, 50)

    // Complete progress after a short delay
    const timeout = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200)
    }, 300)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [pathname])

  if (!isLoading && progress === 0) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-300 ease-out shadow-lg"
        style={{
          width: `${progress}%`,
          opacity: isLoading ? 1 : 0,
          transition: 'width 0.3s ease-out, opacity 0.2s ease-out',
        }}
      />
      {/* Shimmer effect */}
      <div
        className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
        style={{
          transform: `translateX(${progress * 10}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      />
    </div>
  )
}

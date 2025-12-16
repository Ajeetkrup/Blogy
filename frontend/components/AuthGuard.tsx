'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { SpinnerLoader } from '@/components/SkeletonLoader'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, fetchUser, isLoading: storeLoading } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') return

      try {
        // Try to fetch user - this will use the HTTP-only cookie automatically
        // If no valid cookie exists, the API will return 401
          await fetchUser()
          setIsChecking(false)
          // debugger
        } catch (error) {
        // Authentication failed - clear state and redirect to signin
          useAuthStore.getState().setToken(null)
          // debugger
        router.push('/signin')
      }
    }

    checkAuth()
  }, [fetchUser, router])

  if (isChecking || storeLoading) {
    console.log('isChecking', isChecking)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <SpinnerLoader size="lg" />
          <p className="mt-4 text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('isAuthenticated', isAuthenticated)
    return null
  }

  return <>{children}</>
}


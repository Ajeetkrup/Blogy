'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { verifyEmail } from '@/lib/api'
import PageTransition from '@/components/animations/PageTransition'
import AnimatedButton from '@/components/animations/AnimatedButton'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Verification token is missing. Please check your email for the correct verification link.')
      return
    }

    const abortController = process.env.NODE_ENV === 'development' ? new AbortController() : null

    const verify = async () => {
      try {
        const response = await verifyEmail(token, abortController?.signal)
        setStatus('success')
        setMessage(response.message || 'Email verified successfully!')
      } catch (error: any) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
          return
        }
        setStatus('error')
        setMessage(
          error.response?.data?.detail || 
          'Invalid or expired verification token. Please request a new verification email.'
        )
      }
    }

    verify()

    return () => {
      if (abortController) {
        abortController.abort()
      }
    }
  }, [searchParams, router])

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <motion.div
          className="max-w-md w-full relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6 text-center border border-white/20"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {status === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <motion.div
                    className="flex justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1">
                      <div className="rounded-full bg-white p-3">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                      </div>
                    </div>
                  </motion.div>
                  <motion.h2
                    className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ['0%', '100%', '0%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    style={{
                      backgroundSize: '200%',
                    }}
                  >
                    Verifying your email...
                  </motion.h2>
                  <p className="text-gray-600">Please wait while we verify your email address.</p>
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="space-y-6"
                >
                  <motion.div
                    className="flex justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <motion.div
                      className="rounded-full bg-gradient-to-r from-green-400 to-emerald-500 p-1"
                      animate={{
                        boxShadow: [
                          '0 0 0 0 rgba(16, 185, 129, 0.7)',
                          '0 0 0 20px rgba(16, 185, 129, 0)',
                        ],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    >
                      <div className="rounded-full bg-white p-4">
                        <motion.svg
                          className="h-16 w-16 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </motion.svg>
                      </div>
                    </motion.div>
                  </motion.div>
                  
                  {/* Confetti effect */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        background: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'][Math.floor(Math.random() * 4)],
                      }}
                      initial={{ opacity: 0, y: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        y: -100,
                        x: (Math.random() - 0.5) * 100,
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: Math.random() * 0.5,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
                  
                  <motion.h2
                    className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Email Verified!
                  </motion.h2>
                  <motion.p
                    className="text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {message}
                  </motion.p>
                  <motion.p
                    className="text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Redirecting to sign in page...
                  </motion.p>
                  <motion.div
                    className="pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <AnimatedButton
                      onClick={() => router.push('/signin')}
                      variant="primary"
                    >
                      Go to Sign In
                    </AnimatedButton>
                  </motion.div>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="space-y-6"
                >
                  <motion.div
                    className="flex justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <div className="rounded-full bg-gradient-to-r from-red-400 to-rose-500 p-1">
                      <div className="rounded-full bg-white p-4">
                        <motion.svg
                          className="h-16 w-16 text-red-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </motion.svg>
                      </div>
                    </div>
                  </motion.div>
                  <motion.h2
                    className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Verification Failed
                  </motion.h2>
                  <motion.p
                    className="text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {message}
                  </motion.p>
                  <motion.div
                    className="pt-4 space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <AnimatedButton
                      onClick={() => router.push('/signin')}
                      variant="primary"
                      className="w-full"
                    >
                      Go to Sign In
                    </AnimatedButton>
                    <AnimatedButton
                      onClick={() => router.push('/signup')}
                      variant="secondary"
                      className="w-full"
                    >
                      Sign Up Again
                    </AnimatedButton>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  )
}

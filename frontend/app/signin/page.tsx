'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import AnimatedInput from '@/components/animations/AnimatedInput'
import AnimatedButton from '@/components/animations/AnimatedButton'
import PageTransition from '@/components/animations/PageTransition'
import { useToast } from '@/hooks/useToast'

// Valid protected routes that can be used in redirect parameter
const protectedRoutes = [
  '/dashboard',
  '/my-blogs',
  '/analytics',
  '/blog/create',
  '/blog/edit',
]

function isProtectedRoute(path: string): boolean {
  return protectedRoutes.some(route => path.startsWith(route))
}

export default function SignInPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Clean up URL on mount - remove invalid or unnecessary redirect parameters
  useEffect(() => {
    console.log('useEffect')
    if (typeof window === 'undefined') return
    console.log('window is defined')
    const searchParams = new URLSearchParams(window.location.search)
    const redirectParam = searchParams.get('redirect')
    console.log('redirectParam', redirectParam)
    // If redirect parameter exists, validate it
    if (redirectParam) {
      console.log('redirectParam is defined')
      // If redirect is not a valid protected route, remove it
      if (!isProtectedRoute(redirectParam)) {
        console.log('redirectParam is not a valid protected route')
        searchParams.delete('redirect')
        const newUrl = `${window.location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
        router.replace(newUrl)
        return
      }

      // If redirect is default dashboard and user came directly (no document.referrer from our domain),
      // remove it to keep URL clean
      if (redirectParam === '/dashboard') {
        console.log('redirectParam is default dashboard')
        const referer = document.referrer
        console.log('referer', referer)
        // Check if referer is from the same origin and is a protected route
        const refererUrl = referer ? new URL(referer) : null
        const isFromProtectedRoute = refererUrl && 
          refererUrl.origin === window.location.origin && 
          isProtectedRoute(refererUrl.pathname)
        console.log('isFromProtectedRoute', isFromProtectedRoute)
        // If not from a protected route, remove the redirect parameter
        if (!isFromProtectedRoute) {
          console.log('isFromProtectedRoute is false')
          searchParams.delete('redirect')
          const newUrl = `${window.location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
          router.replace(newUrl)
        }
      }
    }
  }, [router])

  // Handle redirect after successful authentication
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined' && !isLoading) {
      // Small delay to ensure state is fully updated and navigation is ready
      const timer = setTimeout(() => {
        const redirectParam = new URLSearchParams(window.location.search).get('redirect')
        // Only use redirect parameter if it's a valid protected route
        const redirectUrl = redirectParam && isProtectedRoute(redirectParam) 
          ? redirectParam 
          : '/dashboard'
        console.log('redirectUrl', redirectUrl)
        router.replace(redirectUrl) // Use replace instead of push to avoid back button issues
        console.log('redirected to', redirectUrl)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, toast, clearError])

  const validateEmail = (emailValue: string): string => {
    if (!emailValue) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) return 'Invalid email format'
    return ''
  }

  const validatePassword = (passwordValue: string): string => {
    if (!passwordValue) return 'Password is required'
    return ''
  }

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true })
    if (field === 'email') {
      const error = validateEmail(email)
      setValidationErrors({ ...validationErrors, email: error })
    } else if (field === 'password') {
      const error = validatePassword(password)
      setValidationErrors({ ...validationErrors, password: error })
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (touched.email) {
      const error = validateEmail(value)
      setValidationErrors({ ...validationErrors, email: error })
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (touched.password) {
      const error = validatePassword(value)
      setValidationErrors({ ...validationErrors, password: error })
    }
  }

  const validateForm = (): boolean => {
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const errors = { email: emailError, password: passwordError }
    setValidationErrors(errors)
    setTouched({ email: true, password: true })
    return !emailError && !passwordError
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) {
      return
    }

    try {
      console.log('handleSubmit')
      await login(email, password)
      console.log('login successful')
      // Redirect is handled by useEffect when isAuthenticated becomes true
      // This ensures the auth state is fully updated before redirecting
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex">
        {/* Left side - Gradient panel */}
        <motion.div
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
            animate={{
              background: [
                'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
                'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #3b82f6 100%)',
                'linear-gradient(135deg, #ec4899 0%, #3b82f6 50%, #8b5cf6 100%)',
                'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          
          {/* Floating elements */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/20 blur-2xl"
              style={{
                width: `${150 + i * 50}px`,
                height: `${150 + i * 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 50, 0],
                y: [0, -50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
            />
          ))}
          
          <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <motion.h1
                className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100"
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  backgroundSize: '200%',
                }}
              >
                Welcome Back
              </motion.h1>
              <p className="text-xl text-white/90 mb-8">
                Sign in to continue your blogging journey
              </p>
              <div className="space-y-4">
                {['Rich Text Editor', 'Analytics Dashboard', 'Beautiful Design'].map((feature, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full bg-white"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                    <span className="text-white/80">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-10 space-y-8 border border-white/20"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.h2
                  className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0%', '100%', '0%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    backgroundSize: '200%',
                  }}
                >
                  Sign In
                </motion.h2>
                <p className="text-gray-600">Welcome back! Please sign in to your account</p>
              </motion.div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <AnimatedInput
                    id="email"
                    name="email"
                    type="email"
                    label="Email address"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => handleBlur('email')}
                    placeholder="Enter your email"
                    error={validationErrors.email}
                    required
                    autoComplete="email"
                    icon={
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    }
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <AnimatedInput
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleBlur('password')}
                    placeholder="Enter your password"
                    error={validationErrors.password}
                    required
                    autoComplete="current-password"
                    showPasswordToggle
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    icon={
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                  />
                </motion.div>

                <motion.div
                  className="flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Link href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Forgot password?
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <AnimatedButton
                    type="submit"
                    disabled={isLoading}
                    loading={isLoading}
                    variant="primary"
                    className="w-full"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </AnimatedButton>
                </motion.div>
              </form>

              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Sign up
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}

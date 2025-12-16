'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import AnimatedInput from '@/components/animations/AnimatedInput'
import AnimatedButton from '@/components/animations/AnimatedButton'
import PasswordStrength from '@/components/PasswordStrength'
import PageTransition from '@/components/animations/PageTransition'
import { useToast } from '@/hooks/useToast'

export default function SignUpPage() {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuthStore()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

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
    if (passwordValue.length < 8) return 'Password must be at least 8 characters'
    return ''
  }

  const validateConfirmPassword = (confirmPasswordValue: string): string => {
    if (!confirmPasswordValue) return 'Please confirm your password'
    if (confirmPasswordValue !== password) return 'Passwords do not match'
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
    } else if (field === 'confirmPassword') {
      const error = validateConfirmPassword(confirmPassword)
      setValidationErrors({ ...validationErrors, confirmPassword: error })
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
    if (touched.confirmPassword && confirmPassword) {
      const error = validateConfirmPassword(confirmPassword)
      setValidationErrors({ ...validationErrors, confirmPassword: error })
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    if (touched.confirmPassword) {
      const error = validateConfirmPassword(value)
      setValidationErrors({ ...validationErrors, confirmPassword: error })
    }
  }

  const validateForm = (): boolean => {
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const confirmPasswordError = validateConfirmPassword(confirmPassword)
    const errors = {
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    }
    setValidationErrors(errors)
    setTouched({ email: true, password: true, confirmPassword: true })
    return !emailError && !passwordError && !confirmPasswordError
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) {
      return
    }

    try {
      await register(email, password)
      toast.success('Registration successful! Please check your email to verify your account.')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setTouched({})
      setValidationErrors({})
    } catch (err) {
      console.error('Registration error:', err)
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
            className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-red-500"
            animate={{
              background: [
                'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #ef4444 100%)',
                'linear-gradient(135deg, #ec4899 0%, #ef4444 50%, #f97316 100%)',
                'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #ec4899 100%)',
                'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #ef4444 100%)',
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          
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
                className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-100"
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
                Join Blogy
              </motion.h1>
              <p className="text-xl text-white/90 mb-8">
                Start your blogging journey today
              </p>
              <div className="space-y-4">
                {['Free Forever', 'No Credit Card', 'Instant Setup'].map((feature, i) => (
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
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6 border border-white/20"
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
                  className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 bg-clip-text text-transparent"
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
                  Create Account
                </motion.h2>
                <p className="text-gray-600">Get started with your free account</p>
              </motion.div>

              <form className="space-y-5" onSubmit={handleSubmit}>
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
                    placeholder="Create a password"
                    error={validationErrors.password}
                    required
                    autoComplete="new-password"
                    showPasswordToggle
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    icon={
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                  />
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <PasswordStrength password={password} />
                    </motion.div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <AnimatedInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="Confirm your password"
                    error={validationErrors.confirmPassword}
                    required
                    autoComplete="new-password"
                    showPasswordToggle
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    icon={
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    }
                  />
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
                    {isLoading ? 'Creating account...' : 'Create Account'}
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
                  Already have an account?{' '}
                  <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Sign in
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

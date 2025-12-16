'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import AnimatedButton from '@/components/animations/AnimatedButton'
import PageTransition from '@/components/animations/PageTransition'

export default function Home() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"
          animate={{
            background: [
              'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
              'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #3b82f6 100%)',
              'linear-gradient(135deg, #ec4899 0%, #3b82f6 50%, #8b5cf6 100%)',
              'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Floating orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20 blur-3xl"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          />
        ))}
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.h1
              className="text-6xl sm:text-7xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-100"
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
              Welcome to Blogy
            </motion.h1>
          </motion.div>
          
          <motion.p
            className="text-xl sm:text-2xl text-white/90 mb-12 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Your modern blogging platform. Share your thoughts, inspire others, and grow your audience.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link href="/signin">
              <AnimatedButton variant="primary" className="w-full sm:w-auto min-w-[200px]">
                Sign In
              </AnimatedButton>
            </Link>
            <Link href="/signup">
              <AnimatedButton variant="secondary" className="w-full sm:w-auto min-w-[200px]">
                Get Started
              </AnimatedButton>
            </Link>
          </motion.div>
          
          {/* Feature highlights */}
          <motion.div
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {[
              { icon: '✍️', title: 'Easy Writing', desc: 'Rich text editor' },
              { icon: '📊', title: 'Analytics', desc: 'Track your performance' },
              { icon: '🎨', title: 'Beautiful', desc: 'Modern design' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}

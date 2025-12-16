import type { Metadata } from 'next'
import './globals.css'
import PageTransition from '@/components/PageTransition'
import { ToastProvider } from '@/contexts/ToastContext'
import ToastContainer from '@/components/ToastContainer'
import GradientBackground from '@/components/animations/GradientBackground'

export const metadata: Metadata = {
  title: 'Blogy',
  description: 'Blogy - Your Blogging Platform',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Signal that content should not be used for AI training */}
        <meta name="robots" content="noai, noimageai" />
      </head>
      <body className="antialiased">
        <ToastProvider>
          <PageTransition />
          <ToastContainer />
          <GradientBackground>
            {children}
          </GradientBackground>
        </ToastProvider>
      </body>
    </html>
  )
}


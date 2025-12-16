'use client'

import { useContext } from 'react'
import { ToastContext } from '@/contexts/ToastContext'
import { ToastType } from '@/components/Toast'

export function useToast() {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  const { showToast } = context

  return {
    toast: {
      error: (message: string, duration?: number) => showToast(message, 'error', duration),
      success: (message: string, duration?: number) => showToast(message, 'success', duration),
      warning: (message: string, duration?: number) => showToast(message, 'warning', duration),
      info: (message: string, duration?: number) => showToast(message, 'info', duration),
    },
    removeToast: context.removeToast,
    clearAllToasts: context.clearAllToasts,
  }
}

'use client'

import { useContext } from 'react'
import { ToastContext } from '@/contexts/ToastContext'
import Toast from './Toast'

export default function ToastContainer() {
  const context = useContext(ToastContext)

  if (!context) {
    return null
  }

  const { toasts, removeToast } = context

  if (toasts.length === 0) {
    return null
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  )
}

"use client"
import React, { createContext, useContext } from 'react'
import { useToast as useToastHook } from '../hooks/useToast'
import { Toast, ToastProps } from '../components/common/Toast'

interface ToastContextType {
  success: (message: string, duration?: number, actionLabel?: string, onAction?: () => void) => void
  error: (message: string, duration?: number, actionLabel?: string, onAction?: () => void) => void
  info: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, success, error, info, warning } = useToastHook()

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
        {toasts.map((toast: ToastProps) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

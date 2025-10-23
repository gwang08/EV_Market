"use client"
import { useState, useCallback } from 'react'
import { ToastProps } from '../components/common/Toast'

export interface ToastOptions {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  actionLabel?: string
  onAction?: () => void
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = useCallback(({ message, type, duration = 3000, actionLabel, onAction }: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = {
      id,
      message,
      type,
      duration,
      onClose: removeToast,
      actionLabel,
      onAction
    }
    
    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message: string, duration?: number, actionLabel?: string, onAction?: () => void) => {
    addToast({ message, type: 'success', duration, actionLabel, onAction })
  }, [addToast])

  const error = useCallback((message: string, duration?: number, actionLabel?: string, onAction?: () => void) => {
    addToast({ message, type: 'error', duration, actionLabel, onAction })
  }, [addToast])

  const info = useCallback((message: string, duration?: number) => {
    addToast({ message, type: 'info', duration })
  }, [addToast])

  const warning = useCallback((message: string, duration?: number) => {
    addToast({ message, type: 'warning', duration })
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
}

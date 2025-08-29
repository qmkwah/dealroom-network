import { useState } from 'react'

export interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (toast: Toast) => {
    setToasts(prev => [...prev, toast])
    // Simple implementation - in a real app you'd show notifications
    console.log('Toast:', toast)
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t !== toast))
    }, 3000)
  }

  return { toast, toasts }
}
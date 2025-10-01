"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export function LoadingSpinner({ size = 'md', className, label = 'Loading...' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'spinner-teal-small',
    md: 'spinner-teal',
    lg: 'w-12 h-12 border-4 border-t-4'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-2" role="status" aria-live="polite">
      <div 
        className={cn(sizeClasses[size], 'spinner-teal', className)}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
      {size === 'lg' && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      )}
    </div>
  )
}

export function LoadingSpinnerInline({ className, label = 'Loading...' }: { className?: string, label?: string }) {
  return (
    <div className="inline-flex items-center space-x-2" role="status" aria-live="polite">
      <div className={cn('spinner-teal-small', className)} aria-hidden="true" />
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    </div>
  )
}
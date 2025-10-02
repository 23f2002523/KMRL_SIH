"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"

interface UserStatusProps {
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function UserStatus({ showLabel = true, size = 'sm' }: UserStatusProps) {
  const { isAuthenticated } = useAuth()
  const [isOnline, setIsOnline] = useState(true)
  const [lastActive, setLastActive] = useState(new Date())

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Update last active time on user interactions
    const updateLastActive = () => setLastActive(new Date())
    
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, updateLastActive, true)
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      events.forEach(event => {
        document.removeEventListener(event, updateLastActive, true)
      })
    }
  }, [])

  if (!isAuthenticated) return null

  const statusColor = isOnline ? 'bg-green-500' : 'bg-red-500'
  const statusText = isOnline ? 'Online' : 'Offline'
  
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3', 
    lg: 'h-4 w-4'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`${sizeClasses[size]} ${statusColor} rounded-full`} />
        {isOnline && (
          <div className={`absolute inset-0 ${statusColor} rounded-full animate-ping opacity-75`} />
        )}
      </div>
      {showLabel && (
        <Badge 
          variant={isOnline ? "default" : "secondary"} 
          className="text-xs"
        >
          {statusText}
        </Badge>
      )}
    </div>
  )
}

export function LastSeenStatus() {
  const { user, isAuthenticated } = useAuth()
  const [lastSeen, setLastSeen] = useState<Date>(new Date())

  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      setLastSeen(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [isAuthenticated])

  if (!isAuthenticated || !user) return null

  const formatLastSeen = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Active now'
    if (diffInMinutes < 60) return `Active ${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Active ${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `Active ${diffInDays}d ago`
  }

  return (
    <span className="text-xs text-muted-foreground">
      {formatLastSeen(lastSeen)}
    </span>
  )
}
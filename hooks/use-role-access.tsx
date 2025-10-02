"use client"

import React from 'react'
import { useAuth } from '@/hooks/use-auth'

interface RoleGuardProps {
  children: React.ReactNode
  role?: 'Admin' | 'Operator'
  fallback?: React.ReactNode
}

export function RoleGuard({ children, role, fallback }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user) {
    return fallback || <div>Access denied. Please log in.</div>
  }

  if (role && user.role !== role && user.role !== 'Admin') {
    return fallback || <div>Access denied. Insufficient privileges.</div>
  }

  return <>{children}</>
}

// Admin Only Guard Component
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard role="Admin" fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

// Role Badge Component
export function RoleBadge({ role, className }: { role?: 'Admin' | 'Operator' | 'Viewer'; className?: string }) {
  if (!role) return null
  
  const roleColors = {
    Admin: 'bg-red-100 text-red-800 border-red-200',
    Operator: 'bg-blue-100 text-blue-800 border-blue-200',
    Viewer: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColors[role]} ${className || ''}`}>
      {role}
    </span>
  )
}

export function useRoleAccess() {
  const { user } = useAuth()

  const isAdmin = user?.role === 'Admin'
  const isOperator = user?.role === 'Operator'

  const hasRole = (role: 'Admin' | 'Operator'): boolean => {
    if (!user) return false
    if (role === 'Admin') return user.role === 'Admin'
    return user.role === 'Admin' || user.role === 'Operator'
  }

  const hasFeature = (feature: 'USER_MANAGEMENT' | 'SYSTEM_ADMIN' | 'ADVANCED_ANALYTICS' | 'TRAIN_CONTROL' | 'CONTENT_MANAGEMENT'): boolean => {
    if (!user) return false
    
    if (user.role === 'Admin') {
      return true // Admin has access to all features
    }
    
    if (user.role === 'Operator') {
      // Operators have access to specific features
      return ['TRAIN_CONTROL', 'ADVANCED_ANALYTICS'].includes(feature)
    }
    
    return false
  }

  return {
    user,
    isAdmin,
    isOperator,
    hasRole,
    hasFeature
  }
}

export default useRoleAccess
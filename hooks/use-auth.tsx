"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useErrorHandler } from '@/hooks/use-error-handler'

export interface User {
  userId: number
  email: string
  name: string
  role: 'Operator' | 'Viewer'
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  logout: () => void
  hasRole: (requiredRole: 'Operator' | 'Viewer') => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { handleError, handleSuccess } = useErrorHandler()

  useEffect(() => {
    // Load token from localStorage on mount
    const savedToken = localStorage.getItem('kmrl-auth-token')
    if (savedToken) {
      setToken(savedToken)
      // Verify token and get user profile
      fetchUserProfile(savedToken)
    } else {
      // Try cookie-based auth
      fetchUserProfile(null)
    }
  }, [])

  const fetchUserProfile = async (authToken: string | null) => {
    try {
      const fetchOptions: RequestInit = {
        credentials: 'include', // Include cookies
      }

      // If we have a localStorage token, use it in Authorization header
      if (authToken) {
        fetchOptions.headers = {
          'Authorization': `Bearer ${authToken}`,
        }
      }

      const response = await fetch('/api/auth/me', fetchOptions)

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.data)
          // If we got user data but don't have a token, it means cookie auth worked
          // In this case, we should create a token for API calls
          if (!authToken && data.token) {
            const newToken = data.token
            setToken(newToken)
            localStorage.setItem('kmrl-auth-token', newToken)
          }
        } else {
          // Token is invalid
          localStorage.removeItem('kmrl-auth-token')
          setToken(null)
        }
      } else {
        // Token is invalid
        localStorage.removeItem('kmrl-auth-token')
        setToken(null)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      localStorage.removeItem('kmrl-auth-token')
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('=== LOGIN ATTEMPT START ===')
      console.log('Sending login request:', { email, password })
      
      let response
      try {
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })
        console.log('Fetch completed, response received')
      } catch (fetchError) {
        console.error('Fetch request failed:', fetchError)
        throw fetchError
      }

      console.log('Login response STATUS:', response.status)
      console.log('Login response OK:', response.ok)
      
      let data
      try {
        data = await response.json()
        console.log('JSON parsing completed')
      } catch (jsonError) {
        console.error('JSON parsing failed:', jsonError)
        throw new Error('Failed to parse response JSON')
      }
      
      console.log('Login response DATA:', data)
      console.log('Data success property:', data.success)
      console.log('Data error property:', data.error)
      console.log('Response data detailed:', JSON.stringify(data, null, 2))

      // Check if response is ok first
      console.log('=== RESPONSE CHECK ===')
      console.log('response.ok:', response.ok)
      console.log('response.status:', response.status)
      console.log('data object:', data)
      console.log('data.success:', data.success)
      console.log('typeof data.success:', typeof data.success)
      
      if (response.ok) {
        console.log('Response OK - checking data.success...')
        if (data.success === true) {
          console.log('Data success is true - processing login...')
          
          if (!data.data) {
            console.error('data.data is missing from response:', data)
            handleError('Invalid response structure from server', { showToast: true })
            return { success: false, error: 'Invalid response from server' }
          }
          
          const { user: userData, token: authToken } = data.data
          console.log('Extracted user and token:', { userData, authToken })
          
          if (!userData || !authToken) {
            console.error('Missing user or token in response:', { userData: !!userData, authToken: !!authToken })
            handleError('Missing user data or token in response', { showToast: true })
            return { success: false, error: 'Missing authentication data' }
          }
          
          setUser(userData)
          setToken(authToken)
          localStorage.setItem('kmrl-auth-token', authToken)
          handleSuccess('Login successful', `Welcome back, ${userData.name}!`)
          return { success: true, user: userData }
        } else {
          console.log('Data success is NOT true:', data.success)
          handleError(data.error || `Server returned success=false`, { showToast: true })
          return { success: false, error: data.error || 'Server returned success=false' }
        }
      } else {
        console.log('Response NOT OK - status:', response.status)
        handleError(data.error || `Login failed (Status: ${response.status})`, { showToast: true })
        return { success: false, error: data.error || `HTTP ${response.status}` }
      }
    } catch (error) {
      handleError(error as Error, { 
        showToast: true, 
        fallbackMessage: 'Login failed. Please check your connection and try again.' 
      })
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }



  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('kmrl-auth-token')
    
    // Call logout API (optional)
    fetch('/api/auth/logout', { method: 'POST' }).catch(console.error)
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  const hasRole = (requiredRole: 'Admin' | 'Operator' | 'Viewer'): boolean => {
    if (!user) return false
    
    const roleHierarchy = {
      'Admin': 3,
      'Operator': 2,
      'Viewer': 1
    }
    
    const userLevel = roleHierarchy[user.role] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0
    
    return userLevel >= requiredLevel
  }

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
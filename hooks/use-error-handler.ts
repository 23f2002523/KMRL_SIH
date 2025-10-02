"use client"

import { useToast } from "@/hooks/use-toast"

interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

interface ErrorHandlerOptions {
  showToast?: boolean
  fallbackMessage?: string
  onError?: (error: ApiError) => void
}

export function useErrorHandler() {
  const { toast } = useToast()

  const handleError = (error: any, options: ErrorHandlerOptions = {}) => {
    const {
      showToast = true,
      fallbackMessage = "An unexpected error occurred. Please try again.",
      onError
    } = options

    let apiError: ApiError = {
      message: fallbackMessage,
      status: 500
    }

    // Parse different error types
    if (error?.response) {
      // Axios-style error
      apiError = {
        message: error.response.data?.message || error.response.data?.error || fallbackMessage,
        code: error.response.data?.code,
        status: error.response.status,
        details: error.response.data
      }
    } else if (error?.message) {
      // Standard JavaScript Error
      apiError.message = error.message
    } else if (typeof error === 'string') {
      // String error
      apiError.message = error
    } else if (error?.error) {
      // Custom API error format
      apiError.message = error.error
      apiError.code = error.code
      apiError.status = error.status
    }

    // Log error for debugging
    console.error('Error handled:', {
      originalError: error,
      parsedError: apiError,
      timestamp: new Date().toISOString()
    })

    // Show toast notification
    if (showToast) {
      toast({
        variant: "destructive",
        title: "Error",
        description: apiError.message,
      })
    }

    // Call custom error handler
    if (onError) {
      onError(apiError)
    }

    return apiError
  }

  const handleSuccess = (message: string, description?: string) => {
    toast({
      variant: "default",
      title: "Success",
      description: message,
    })
  }

  const handleApiError = async (response: Response, options: ErrorHandlerOptions = {}) => {
    let errorData: any = {}
    
    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json()
      } else {
        errorData = { message: await response.text() }
      }
    } catch (parseError) {
      errorData = { message: `HTTP ${response.status}: ${response.statusText}` }
    }

    const apiError: ApiError = {
      message: errorData.message || errorData.error || `Request failed with status ${response.status}`,
      code: errorData.code,
      status: response.status,
      details: errorData
    }

    return handleError(apiError, options)
  }

  return {
    handleError,
    handleSuccess,
    handleApiError
  }
}

// Common error types for better type safety
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
} as const

export type ErrorType = typeof ErrorTypes[keyof typeof ErrorTypes]
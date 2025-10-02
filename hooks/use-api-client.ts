"use client"

import { useErrorHandler } from "@/hooks/use-error-handler"

interface ApiClientOptions {
  baseUrl?: string
  defaultHeaders?: Record<string, string>
  timeout?: number
}

interface RequestOptions extends RequestInit {
  timeout?: number
  showErrorToast?: boolean
  fallbackErrorMessage?: string
}

export function useApiClient(options: ApiClientOptions = {}) {
  const { handleError, handleApiError, handleSuccess } = useErrorHandler()
  
  const { 
    baseUrl = '', 
    defaultHeaders = {}, 
    timeout = 10000 
  } = options

  const makeRequest = async <T = any>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<T> => {
    const {
      timeout: requestTimeout = timeout,
      showErrorToast = true,
      fallbackErrorMessage = "Request failed. Please try again.",
      ...fetchOptions
    } = options

    // Get auth token if available
    const token = typeof window !== 'undefined' ? 
      localStorage.getItem('kmrl-auth-token') : null

    const headers = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout)

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        await handleApiError(response, { 
          showToast: showErrorToast, 
          fallbackMessage: fallbackErrorMessage 
        })
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        return await response.text() as T
      }

    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout')
        handleError(timeoutError, { 
          showToast: showErrorToast, 
          fallbackMessage: "Request timed out. Please try again." 
        })
        throw timeoutError
      }

      // Re-throw if it's already been handled
      if (error.message?.includes('HTTP')) {
        throw error
      }

      // Handle network errors
      handleError(error, { 
        showToast: showErrorToast, 
        fallbackMessage: fallbackErrorMessage 
      })
      throw error
    }
  }

  const get = <T = any>(endpoint: string, options?: RequestOptions) => 
    makeRequest<T>(endpoint, { ...options, method: 'GET' })

  const post = <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })

  const put = <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })

  const patch = <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })

  const del = <T = any>(endpoint: string, options?: RequestOptions) =>
    makeRequest<T>(endpoint, { ...options, method: 'DELETE' })

  return {
    request: makeRequest,
    get,
    post,
    put,
    patch,
    delete: del,
    handleSuccess
  }
}

// Pre-configured API client for common use
export const createApiClient = (options?: ApiClientOptions) => {
  const client = useApiClient(options)
  return client
}
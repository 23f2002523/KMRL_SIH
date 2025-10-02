import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: string
  timestamp: string
  requestId?: string
}

export class ApiResponseBuilder {
  private response: Partial<ApiResponse> = {
    timestamp: new Date().toISOString()
  }

  static success<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    })
  }

  static error(
    error: string, 
    status: number = 400, 
    code?: string,
    requestId?: string
  ): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: false,
      error,
      code,
      timestamp: new Date().toISOString(),
      requestId
    }, { status })
  }

  static validationError(
    error: string, 
    details?: any
  ): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: false,
      error,
      code: 'VALIDATION_ERROR',
      data: details,
      timestamp: new Date().toISOString()
    }, { status: 400 })
  }

  static unauthorized(
    error: string = 'Unauthorized access'
  ): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: false,
      error,
      code: 'UNAUTHORIZED',
      timestamp: new Date().toISOString()
    }, { status: 401 })
  }

  static forbidden(
    error: string = 'Access forbidden'
  ): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: false,
      error,
      code: 'FORBIDDEN',
      timestamp: new Date().toISOString()
    }, { status: 403 })
  }

  static notFound(
    error: string = 'Resource not found'
  ): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: false,
      error,
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString()
    }, { status: 404 })
  }

  static serverError(
    error: string = 'Internal server error',
    requestId?: string
  ): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: false,
      error,
      code: 'SERVER_ERROR',
      timestamp: new Date().toISOString(),
      requestId
    }, { status: 500 })
  }

  static rateLimit(
    error: string = 'Too many requests'
  ): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: false,
      error,
      code: 'RATE_LIMIT',
      timestamp: new Date().toISOString()
    }, { status: 429 })
  }

  static created<T>(
    data: T, 
    message?: string
  ): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    }, { status: 201 })
  }

  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 })
  }

  // Paginated response helper
  static paginated<T>(
    data: T[],
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    },
    message?: string
  ): NextResponse<ApiResponse<{ items: T[], pagination: typeof pagination }>> {
    return NextResponse.json({
      success: true,
      data: {
        items: data,
        pagination
      },
      message,
      timestamp: new Date().toISOString()
    })
  }
}

// Common HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  RATE_LIMITED: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503
} as const

// Common error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVER_ERROR: 'SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]
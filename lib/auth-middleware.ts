import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader, hasRole, type TokenPayload } from '@/lib/auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload
}

/**
 * Authentication middleware - verifies JWT token
 */
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Try to get token from Authorization header first, then from cookies
      const authHeader = req.headers.get('authorization')
      let token = extractTokenFromHeader(authHeader)

      if (!token) {
        // Try to get token from cookies
        token = req.cookies.get('token')?.value || null
      }

      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }

      const user = verifyToken(token)
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        )
      }

      // Add user to request object
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = user

      return handler(authenticatedReq)
    } catch (error) {
      console.error('Authentication error:', error)
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}

/**
 * Role-based authorization middleware
 */
export function withRole(
  requiredRole: 'Admin' | 'Operator' | 'Viewer',
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
    const user = req.user!

    if (!hasRole(user.role, requiredRole)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Access denied. Required role: ${requiredRole}. Your role: ${user.role}` 
        },
        { status: 403 }
      )
    }

    return handler(req)
  })
}

/**
 * Admin-only middleware
 */
export function withAdminRole(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withRole('Admin', handler)
}

/**
 * Operator or Admin middleware
 */
export function withOperatorRole(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withRole('Operator', handler)
}

/**
 * Extract user info from authenticated request
 */
export function getCurrentUser(req: AuthenticatedRequest): TokenPayload | null {
  return req.user || null
}
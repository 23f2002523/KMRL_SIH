import jwt, { SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'kmrl-sih-2025-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface UserPayload {
  userId: number
  email: string
  name: string
  role: 'Operator' | 'Viewer'
}

export interface TokenPayload extends UserPayload {
  iat: number
  exp: number
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: UserPayload): string {
  const payload = { userId: user.userId, email: user.email, name: user.name, role: user.role }
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: '7d' })
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    return null
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRole: 'Operator' | 'Viewer'): boolean {
  const roleHierarchy = {
    'Operator': 2,
    'Viewer': 1
  }
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole] || 0
  
  return userLevel >= requiredLevel
}

/**
 * Generate secure random token for password reset, etc.
 */
export function generateSecureToken(): string {
  return Math.random().toString(36).substr(2) + Date.now().toString(36)
}
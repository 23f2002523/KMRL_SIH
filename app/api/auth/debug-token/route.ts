import { NextRequest, NextResponse } from 'next/server'
import { withAuth, getCurrentUser, type AuthenticatedRequest } from '@/lib/auth-middleware'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'kmrl-sih-2025-secret-key'

async function handleGetDebugToken(request: AuthenticatedRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Generate a token for this user
    const token = jwt.sign(
      { 
        userId: user.userId, 
        role: user.role, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      success: true,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      message: 'Debug token generated - this endpoint should be removed in production'
    })
  } catch (error) {
    console.error('Error generating debug token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handleGetDebugToken)
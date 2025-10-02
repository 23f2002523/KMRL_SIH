import { type NextRequest, NextResponse } from "next/server"
import { withAuth, getCurrentUser, type AuthenticatedRequest } from "@/lib/auth-middleware"

// GET /api/auth/me - Get current user profile
async function handleGetProfile(req: AuthenticatedRequest) {
  try {
    const user = getCurrentUser(req)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// Export the authenticated handler
export const GET = withAuth(handleGetProfile)
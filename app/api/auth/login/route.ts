import { type NextRequest, NextResponse } from "next/server"
import { trainDb } from "@/lib/db/train-db"
import { trainUsers } from "@/lib/db/train-schema"
import { eq } from "drizzle-orm"
import { comparePassword, generateToken } from "@/lib/auth"
import { withLogging } from "@/lib/logger"
import { ApiResponseBuilder, ERROR_CODES } from "@/lib/api-response"

// POST /api/auth/login - User login
async function loginHandler(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.email || !body.password) {
      return ApiResponseBuilder.validationError(
        'Email and password are required'
      )
    }

    // Find user by email
    const [user] = await trainDb
      .select()
      .from(trainUsers)
      .where(eq(trainUsers.email, body.email.toLowerCase()))
      .limit(1)

    if (!user) {
      return ApiResponseBuilder.unauthorized('Invalid email or password')
    }

    // Verify password
    const isPasswordValid = await comparePassword(body.password, user.passwordHash)
    if (!isPasswordValid) {
      return ApiResponseBuilder.unauthorized('Invalid email or password')
    }

    // Check if user role is Admin or Operator
    if (user.role !== 'Admin' && user.role !== 'Operator') {
      return ApiResponseBuilder.forbidden('Access denied. Only Admin and Operator roles are allowed.')
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role as 'Admin' | 'Operator' | 'Viewer',
    })

    // Update last login timestamp
    await trainDb
      .update(trainUsers)
      .set({ updatedAt: new Date() })
      .where(eq(trainUsers.userId, user.userId))

    // Return user data (without password hash) and token
    const { passwordHash, ...userWithoutPassword } = user

    // Create response with token cookie
    const response = NextResponse.json(
      ApiResponseBuilder.success(
        {
          user: userWithoutPassword,
          token,
        },
        'Login successful'
      )
    )

    // Set HTTP-only cookie with token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    const requestId = request.headers.get('x-request-id') || undefined
    return ApiResponseBuilder.serverError('Login failed', requestId)
  }
}

export const POST = withLogging(loginHandler)
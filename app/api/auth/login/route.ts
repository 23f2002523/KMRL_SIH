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
    console.log('Login request received')
    const body = await request.json()
    console.log('Request body:', body)

    // Validate required fields
    if (!body.email || !body.password) {
      console.log('Validation failed: missing email or password')
      return ApiResponseBuilder.validationError(
        'Email and password are required'
      )
    }

    // Find user by email
    console.log('Looking for user with email:', body.email.toLowerCase())
    const [user] = await trainDb
      .select()
      .from(trainUsers)
      .where(eq(trainUsers.email, body.email.toLowerCase()))
      .limit(1)

    console.log('Found user:', user ? { id: user.userId, email: user.email, role: user.role } : 'No user found')

    if (!user) {
      console.log('User not found, returning unauthorized')
      return ApiResponseBuilder.unauthorized('Invalid email or password')
    }

    // Verify password
    console.log('Verifying password...')
    const isPasswordValid = await comparePassword(body.password, user.passwordHash)
    console.log('Password valid:', isPasswordValid)
    if (!isPasswordValid) {
      console.log('Password invalid, returning unauthorized')
      return ApiResponseBuilder.unauthorized('Invalid email or password')
    }

    // Check if user role is Operator
    if (user.role !== 'Operator') {
      console.log('Role check failed:', user.role)
      return ApiResponseBuilder.forbidden('Access denied. Only Operator role is allowed.')
    }

    console.log('Role check passed, generating token...')
    // Generate JWT token
    const token = generateToken({
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role as 'Operator' | 'Viewer',
    })
    console.log('Token generated successfully')

    // Update last login timestamp
    await trainDb
      .update(trainUsers)
      .set({ updatedAt: new Date() })
      .where(eq(trainUsers.userId, user.userId))

    // Return user data (without password hash) and token
    const { passwordHash, ...userWithoutPassword } = user
    console.log('Preparing success response with user:', userWithoutPassword)

    // Create response with token cookie
    const response = ApiResponseBuilder.success(
      {
        user: userWithoutPassword,
        token,
      },
      'Login successful'
    )
    console.log('Response created successfully')

    // Set HTTP-only cookie with token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    console.log('Returning success response')
    return response
  } catch (error: any) {
    console.error('Login error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error message:', error.message)
    const requestId = request.headers.get('x-request-id') || undefined
    return ApiResponseBuilder.serverError('Login failed', requestId)
  }
}

export const POST = withLogging(loginHandler)
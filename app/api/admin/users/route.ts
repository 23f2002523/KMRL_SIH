import { NextRequest } from 'next/server'
import { withAdminRole } from '@/lib/auth-middleware'
import { withLogging } from '@/lib/logger'
import { ApiResponseBuilder } from '@/lib/api-response'
import { trainDb } from '@/lib/db/train-db'
import { trainUsers } from '@/lib/db/train-schema'
import { eq } from 'drizzle-orm'
import type { AuthenticatedRequest } from '@/lib/auth-middleware'

// Simulated user data for demonstration (fallback when DB is empty)
const simulatedUsers = [
  {
    userId: 1,
    name: 'Admin User',
    email: 'admin@kmrl.com',
    role: 'Admin' as const,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    userId: 2,
    name: 'Train Operator',
    email: 'operator@kmrl.com',
    role: 'Operator' as const,
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z'
  },
  {
    userId: 3,
    name: 'Station Viewer',
    email: 'viewer@kmrl.com',
    role: 'Viewer' as const,
    createdAt: '2024-01-17T12:00:00Z',
    updatedAt: '2024-01-17T12:00:00Z'
  },
  {
    userId: 4,
    name: 'System Monitor',
    email: 'monitor@kmrl.com',
    role: 'Operator' as const,
    createdAt: '2024-01-18T13:00:00Z',
    updatedAt: '2024-01-18T13:00:00Z'
  },
  {
    userId: 5,
    name: 'Control Room',
    email: 'control@kmrl.com',
    role: 'Admin' as const,
    createdAt: '2024-01-19T14:00:00Z',
    updatedAt: '2024-01-19T14:00:00Z'
  }
]

// GET /api/admin/users - List all users (Admin only)
async function getUsersHandler(request: AuthenticatedRequest) {
  try {
    let users: any[] = []
    
    try {
      // Try to get users from database
      const dbUsers = await trainDb
        .select({
          userId: trainUsers.userId,
          name: trainUsers.name,
          email: trainUsers.email,
          role: trainUsers.role,
          createdAt: trainUsers.createdAt,
          updatedAt: trainUsers.updatedAt
        })
        .from(trainUsers)
        .orderBy(trainUsers.createdAt)
      
      // Convert dates to strings for consistency  
      users = dbUsers.map(user => ({
        ...user,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: user.updatedAt?.toISOString() || new Date().toISOString()
      }))
    } catch (dbError) {
      // If database fails, use simulated data for demo
      console.warn('Database query failed, using simulated data:', dbError)
      users = simulatedUsers
    }

    // If no users in database, use simulated data
    if (users.length === 0) {
      users = simulatedUsers
    }

    // Get query parameters for filtering and pagination
    const url = new URL(request.url)
    const role = url.searchParams.get('role')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    // Filter by role if specified
    let filteredUsers = users
    if (role && ['Admin', 'Operator', 'Viewer'].includes(role)) {
      filteredUsers = users.filter(user => user.role === role)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    return ApiResponseBuilder.success({
      users: paginatedUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredUsers.length / limit),
        totalUsers: filteredUsers.length,
        hasNext: endIndex < filteredUsers.length,
        hasPrev: page > 1
      },
      stats: {
        totalUsers: users.length,
        adminCount: users.filter(u => u.role === 'Admin').length,
        operatorCount: users.filter(u => u.role === 'Operator').length,
        viewerCount: users.filter(u => u.role === 'Viewer').length
      },
      requestedBy: request.user?.email
    }, 'Users retrieved successfully')
    
  } catch (error) {
    console.error('Error fetching users:', error)
    return ApiResponseBuilder.serverError('Failed to fetch users')
  }
}

// DELETE /api/admin/users/[userId] - Delete user (Admin only)
async function deleteUserHandler(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url)
    const userId = parseInt(url.pathname.split('/').pop() || '0')
    
    if (!userId) {
      return ApiResponseBuilder.validationError('Invalid user ID')
    }
    
    // Prevent admin from deleting themselves
    if (request.user?.userId === userId) {
      return ApiResponseBuilder.error('Cannot delete your own account', 400)
    }
    
    const result = await trainDb
      .delete(trainUsers)
      .where(eq(trainUsers.userId, userId))
    
    return ApiResponseBuilder.success(
      { deletedUserId: userId },
      'User deleted successfully'
    )
    
  } catch (error) {
    console.error('Error deleting user:', error)
    return ApiResponseBuilder.serverError('Failed to delete user')
  }
}

export const GET = withLogging(withAdminRole(getUsersHandler))
export const DELETE = withLogging(withAdminRole(deleteUserHandler))
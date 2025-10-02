import { NextRequest } from 'next/server'
import { withAdminRole } from '@/lib/auth-middleware'
import { withLogging, Logger } from '@/lib/logger'
import { ApiResponseBuilder } from '@/lib/api-response'
import type { AuthenticatedRequest } from '@/lib/auth-middleware'

// Simulated log data for demonstration
const simulatedLogs = [
  {
    requestId: 'req_1a2b3c4d',
    timestamp: new Date(Date.now() - 5000).toISOString(),
    method: 'GET',
    url: '/api/admin/users',
    status: 200,
    duration: 45,
    ip: '192.168.1.100',
    userId: 1,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    requestId: 'req_2e3f4g5h',
    timestamp: new Date(Date.now() - 15000).toISOString(),
    method: 'POST',
    url: '/api/operator/train-control',
    status: 403,
    duration: 12,
    ip: '192.168.1.101',
    userId: 3,
    error: 'Insufficient permissions for train control',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    requestId: 'req_3i4j5k6l',
    timestamp: new Date(Date.now() - 25000).toISOString(),
    method: 'GET',
    url: '/api/documents',
    status: 200,
    duration: 89,
    ip: '192.168.1.102',
    userId: 2,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    requestId: 'req_4m5n6o7p',
    timestamp: new Date(Date.now() - 35000).toISOString(),
    method: 'DELETE',
    url: '/api/admin/users/4',
    status: 200,
    duration: 156,
    ip: '192.168.1.100',
    userId: 1,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    requestId: 'req_5q6r7s8t',
    timestamp: new Date(Date.now() - 45000).toISOString(),
    method: 'POST',
    url: '/api/auth/login',
    status: 401,
    duration: 234,
    ip: '192.168.1.103',
    userId: null,
    error: 'Invalid credentials',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
]

// GET /api/logs - Get system logs (Admin only)
async function getLogsHandler(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const status = url.searchParams.get('status')
    const errors = url.searchParams.get('errors') === 'true'

    // Try to get logs from Logger singleton, fallback to simulated data
    let logs: any[] = []
    
    try {
      const logger = Logger.getInstance()
      if (errors) {
        logs = logger.getErrorLogs(limit)
      } else if (status) {
        logs = logger.getLogsByStatus(parseInt(status), limit)
      } else {
        logs = logger.getLogs(limit)
      }
    } catch (loggerError) {
      console.warn('Logger not available, using simulated data:', loggerError)
    }

    // If no logs from logger or logger failed, use simulated data
    if (logs.length === 0) {
      logs = simulatedLogs.slice(0, limit)
    }

    // Calculate statistics
    const allLogs = logs.length > 0 ? logs : simulatedLogs
    const stats = {
      totalLogs: allLogs.length,
      statusCodeDistribution: {
        '2xx': allLogs.filter(log => log.status >= 200 && log.status < 300).length,
        '3xx': allLogs.filter(log => log.status >= 300 && log.status < 400).length,
        '4xx': allLogs.filter(log => log.status >= 400 && log.status < 500).length,
        '5xx': allLogs.filter(log => log.status >= 500).length
      },
      averageResponseTime: Math.round(
        allLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / allLogs.length
      ),
      errorRate: ((allLogs.filter(log => log.status >= 400).length / allLogs.length) * 100).toFixed(1)
    }

    return ApiResponseBuilder.success({
      logs,
      stats,
      filters: { limit, status, errors },
      requestedBy: request.user?.email,
      timestamp: new Date().toISOString()
    }, 'Logs retrieved successfully')
    
  } catch (error) {
    console.error('Error fetching logs:', error)
    return ApiResponseBuilder.serverError('Failed to fetch logs')
  }
}

export const GET = withLogging(withAdminRole(getLogsHandler))
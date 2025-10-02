import { NextRequest, NextResponse } from 'next/server'

interface LogEntry {
  timestamp: string
  method: string
  url: string
  status: number
  duration: number
  userAgent?: string
  ip?: string
  userId?: string
  requestId: string
  body?: any
  query?: any
  error?: string
}

class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []
  private maxLogs = 1000 // Keep last 1000 logs in memory

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  log(entry: LogEntry) {
    // Add to in-memory logs
    this.logs.unshift(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Console log with formatting
    this.consoleLog(entry)

    // In production, you might want to send logs to external service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(entry)
    }
  }

  private consoleLog(entry: LogEntry) {
    const { timestamp, method, url, status, duration, requestId, error } = entry
    
    let color = '\x1b[32m' // Green for success
    if (status >= 400 && status < 500) color = '\x1b[33m' // Yellow for client errors
    if (status >= 500) color = '\x1b[31m' // Red for server errors

    const logMessage = `${color}[${timestamp}] ${method} ${url} - ${status} (${duration}ms) [${requestId}]\x1b[0m`
    
    if (error) {
      console.error(logMessage, '\n  Error:', error)
    } else {
      console.log(logMessage)
    }
  }

  private async sendToExternalService(entry: LogEntry) {
    // Example: Send to external logging service
    // await fetch('https://your-logging-service.com/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(entry)
    // })
  }

  getLogs(limit = 100): LogEntry[] {
    return this.logs.slice(0, limit)
  }

  getLogsByStatus(status: number, limit = 100): LogEntry[] {
    return this.logs.filter(log => log.status === status).slice(0, limit)
  }

  getErrorLogs(limit = 100): LogEntry[] {
    return this.logs.filter(log => log.status >= 400).slice(0, limit)
  }
}

// Generate unique request ID
function generateRequestId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// Extract user ID from JWT token
function extractUserId(request: NextRequest): string | undefined {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return undefined

    const token = authHeader.substring(7)
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId || payload.sub
  } catch {
    return undefined
  }
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP
  if (cfConnectingIP) return cfConnectingIP
  return 'unknown'
}

// Logging middleware wrapper for API routes
export function withLogging<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const startTime = Date.now()
    const requestId = generateRequestId()
    const logger = Logger.getInstance()
    
    // Add request ID to headers for tracing
    request.headers.set('x-request-id', requestId)
    
    let response: NextResponse
    let error: string | undefined
    let requestBody: any

    try {
      // Parse request body for logging (if JSON)
      try {
        if (request.headers.get('content-type')?.includes('application/json')) {
          requestBody = await request.clone().json()
          // Don't log sensitive data
          if (requestBody.password) requestBody.password = '[REDACTED]'
          if (requestBody.token) requestBody.token = '[REDACTED]'
        }
      } catch {
        // Ignore body parsing errors
      }

      response = await handler(request, ...args)
      
    } catch (err: any) {
      error = err.message || 'Internal Server Error'
      response = NextResponse.json(
        { 
          error: 'Internal Server Error',
          requestId,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    // Create log entry
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      status: response.status,
      duration,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: getClientIP(request),
      userId: extractUserId(request),
      requestId,
      body: request.method !== 'GET' ? requestBody : undefined,
      query: Object.fromEntries(new URL(request.url).searchParams),
      error
    }

    logger.log(logEntry)

    // Add request ID to response headers
    response.headers.set('x-request-id', requestId)
    
    return response
  }
}

// Express-style logging middleware (if you were using Express)
export function requestLogger(req: any, res: any, next: any) {
  const startTime = Date.now()
  const requestId = generateRequestId()
  
  req.requestId = requestId
  req.startTime = startTime

  res.on('finish', () => {
    const duration = Date.now() - startTime
    const logger = Logger.getInstance()
    
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id,
      requestId,
      body: req.method !== 'GET' ? req.body : undefined,
      query: req.query
    }

    logger.log(logEntry)
  })

  next()
}

export { Logger }
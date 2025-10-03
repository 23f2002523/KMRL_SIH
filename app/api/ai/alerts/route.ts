import { NextRequest, NextResponse } from 'next/server'
import { generateSmartAlerts } from '@/lib/ai-predictions'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'kmrl-sih-2025-secret-key'

// GET /api/ai/alerts - Get smart alerts
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    let token = request.cookies.get('token')?.value
    
    if (!token) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    let userRole: string
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { role: string }
      userRole = decoded.role
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check permissions
    if (!['Admin', 'Operator'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const url = new URL(request.url)
    const priority = url.searchParams.get('priority')
    const type = url.searchParams.get('type')
    const limit = parseInt(url.searchParams.get('limit') || '100')

    console.log('Generating smart alerts...')
    
    let alerts = await generateSmartAlerts()

    // Filter by priority if specified
    if (priority) {
      alerts = alerts.filter(a => a.priority === parseInt(priority))
    }

    // Filter by type if specified
    if (type) {
      alerts = alerts.filter(a => a.type === type.toUpperCase())
    }

    // Limit results
    alerts = alerts.slice(0, limit)

    // Generate summary
    const summary = {
      total: alerts.length,
      critical: alerts.filter(a => a.priority === 1).length,
      high: alerts.filter(a => a.priority === 2).length,
      medium: alerts.filter(a => a.priority === 3).length,
      low: alerts.filter(a => a.priority >= 4).length,
      byType: {
        prediction: alerts.filter(a => a.type === 'PREDICTION').length,
        pattern: alerts.filter(a => a.type === 'PATTERN').length,
        overdue: alerts.filter(a => a.type === 'OVERDUE').length,
        critical: alerts.filter(a => a.type === 'CRITICAL').length
      },
      totalEstimatedCost: alerts.reduce((sum, a) => sum + (a.estimatedCost || 0), 0),
      totalEstimatedDowntime: alerts.reduce((sum, a) => sum + (a.estimatedDowntime || 0), 0)
    }

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        summary,
        generatedAt: new Date().toISOString()
      },
      message: `Generated ${alerts.length} smart alerts`
    })

  } catch (error) {
    console.error('Smart alerts error:', error)
    return NextResponse.json({
      error: 'Failed to generate smart alerts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
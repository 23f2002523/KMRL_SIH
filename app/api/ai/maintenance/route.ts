import { NextRequest, NextResponse } from 'next/server'
import { predictMaintenanceOverdue } from '@/lib/ai-predictions'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'kmrl-sih-2025-secret-key'

// GET /api/ai/maintenance - Get maintenance predictions
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
    const riskLevel = url.searchParams.get('riskLevel')
    const limit = parseInt(url.searchParams.get('limit') || '50')

    console.log('Generating maintenance predictions...')
    
    let predictions = await predictMaintenanceOverdue()

    // Filter by risk level if specified
    if (riskLevel) {
      predictions = predictions.filter(p => p.riskLevel === riskLevel.toUpperCase())
    }

    // Limit results
    predictions = predictions.slice(0, limit)

    // Generate summary
    const summary = {
      total: predictions.length,
      critical: predictions.filter(p => p.riskLevel === 'CRITICAL').length,
      high: predictions.filter(p => p.riskLevel === 'HIGH').length,
      medium: predictions.filter(p => p.riskLevel === 'MEDIUM').length,
      low: predictions.filter(p => p.riskLevel === 'LOW').length,
      averageConfidence: predictions.length > 0 
        ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length 
        : 0,
      totalHighRiskPredictions: predictions.filter(p => ['HIGH', 'CRITICAL'].includes(p.riskLevel)).length,
      avgDaysOverdue: predictions.length > 0
        ? predictions.reduce((sum, p) => sum + (p.daysUntilOverdue < 0 ? Math.abs(p.daysUntilOverdue) : 0), 0) / predictions.length
        : 0
    }

    return NextResponse.json({
      success: true,
      data: {
        predictions,
        summary,
        generatedAt: new Date().toISOString()
      },
      message: `Generated ${predictions.length} maintenance predictions`
    })

  } catch (error) {
    console.error('Maintenance predictions error:', error)
    return NextResponse.json({
      error: 'Failed to generate maintenance predictions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
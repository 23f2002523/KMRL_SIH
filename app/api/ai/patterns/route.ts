import { NextRequest, NextResponse } from 'next/server'
import { detectFailurePatterns } from '@/lib/ai-predictions'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'kmrl-sih-2025-secret-key'

// GET /api/ai/patterns - Get failure pattern analysis
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
    const minRiskScore = parseInt(url.searchParams.get('minRiskScore') || '0')
    const limit = parseInt(url.searchParams.get('limit') || '50')

    console.log('Detecting failure patterns...')
    
    let patterns = await detectFailurePatterns()

    // Filter by minimum risk score if specified
    if (minRiskScore > 0) {
      patterns = patterns.filter(p => p.riskScore >= minRiskScore)
    }

    // Limit results
    patterns = patterns.slice(0, limit)

    // Generate summary
    const summary = {
      total: patterns.length,
      highRisk: patterns.filter(p => p.riskScore >= 80).length,
      mediumRisk: patterns.filter(p => p.riskScore >= 50 && p.riskScore < 80).length,
      lowRisk: patterns.filter(p => p.riskScore < 50).length,
      averageRiskScore: patterns.length > 0 
        ? patterns.reduce((sum, p) => sum + p.riskScore, 0) / patterns.length 
        : 0,
      mostCommonMaintenanceType: getMostCommonMaintenanceType(patterns),
      shortestFailureInterval: patterns.length > 0
        ? Math.min(...patterns.map(p => p.avgDaysBetweenFailures))
        : 0
    }

    return NextResponse.json({
      success: true,
      data: {
        patterns,
        summary,
        generatedAt: new Date().toISOString()
      },
      message: `Detected ${patterns.length} failure patterns`
    })

  } catch (error) {
    console.error('Failure patterns error:', error)
    return NextResponse.json({
      error: 'Failed to detect failure patterns',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getMostCommonMaintenanceType(patterns: any[]): string {
  if (patterns.length === 0) return 'None'
  
  const typeCounts: { [key: string]: number } = {}
  patterns.forEach(p => {
    typeCounts[p.maintenanceType] = (typeCounts[p.maintenanceType] || 0) + 1
  })
  
  return Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
}
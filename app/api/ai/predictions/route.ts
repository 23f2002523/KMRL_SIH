import { NextRequest, NextResponse } from 'next/server'
import { predictMaintenanceOverdue, detectFailurePatterns, generateSmartAlerts } from '@/lib/ai-predictions'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'kmrl-sih-2025-secret-key'

// GET /api/ai/predictions - Get AI predictions and analysis
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

    // Check if user has access to AI predictions (Operator only)
    if (userRole !== 'Operator') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get query parameters to determine what to fetch
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'all'

    console.log('Generating AI predictions for type:', type)

    const results: any = {
      timestamp: new Date().toISOString(),
      type: type
    }

    // Generate requested predictions
    if (type === 'all' || type === 'maintenance') {
      console.log('Predicting maintenance overdue...')
      results.maintenancePredictions = await predictMaintenanceOverdue()
      console.log(`Generated ${results.maintenancePredictions.length} maintenance predictions`)
    }

    if (type === 'all' || type === 'patterns') {
      console.log('Detecting failure patterns...')
      results.failurePatterns = await detectFailurePatterns()
      console.log(`Detected ${results.failurePatterns.length} failure patterns`)
    }

    if (type === 'all' || type === 'alerts') {
      console.log('Generating smart alerts...')
      results.smartAlerts = await generateSmartAlerts()
      console.log(`Generated ${results.smartAlerts.length} smart alerts`)
    }

    // Generate summary statistics
    if (type === 'all') {
      results.summary = {
        totalPredictions: results.maintenancePredictions?.length || 0,
        criticalPredictions: results.maintenancePredictions?.filter((p: any) => p.riskLevel === 'CRITICAL').length || 0,
        highRiskPredictions: results.maintenancePredictions?.filter((p: any) => p.riskLevel === 'HIGH').length || 0,
        failurePatternsDetected: results.failurePatterns?.length || 0,
        highRiskPatterns: results.failurePatterns?.filter((p: any) => p.riskScore >= 80).length || 0,
        totalAlerts: results.smartAlerts?.length || 0,
        criticalAlerts: results.smartAlerts?.filter((a: any) => a.priority === 1).length || 0,
        estimatedCosts: results.smartAlerts?.reduce((sum: number, alert: any) => sum + (alert.estimatedCost || 0), 0) || 0,
        estimatedDowntime: results.smartAlerts?.reduce((sum: number, alert: any) => sum + (alert.estimatedDowntime || 0), 0) || 0
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: 'AI predictions generated successfully'
    })

  } catch (error) {
    console.error('AI Predictions API error:', error)
    return NextResponse.json({
      error: 'Failed to generate predictions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/ai/predictions - Trigger prediction update (for scheduled tasks)
export async function POST(request: NextRequest) {
  try {
    // Check authentication (Operator access for triggering updates)
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

    if (userRole !== 'Operator') {
      return NextResponse.json({ error: 'Operator access required' }, { status: 403 })
    }

    // Run all predictions and store alerts in database
    console.log('Triggering AI prediction update...')
    
    const smartAlerts = await generateSmartAlerts()
    
    // Here we could store the alerts in the database if needed
    // For now, we just return the results
    
    return NextResponse.json({
      success: true,
      message: 'AI predictions updated successfully',
      alertsGenerated: smartAlerts.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI Predictions update error:', error)
    return NextResponse.json({
      error: 'Failed to update predictions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
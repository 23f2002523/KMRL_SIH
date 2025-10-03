import { NextRequest, NextResponse } from 'next/server'
import { trainDb } from '@/lib/db/train-db'
import { documentDataRecords } from '@/lib/db/train-schema'
import { desc } from 'drizzle-orm'
import { withAuth, getCurrentUser, type AuthenticatedRequest } from '@/lib/auth-middleware'

interface AlertData {
  id: number
  trainId: string
  type: 'critical' | 'upcoming' | 'ai-predicted'
  priority: 'High' | 'Medium' | 'Low'
  title: string
  description: string
  daysOverdue?: number
  daysUntilDue?: number
  maintenanceType: string
  lastMaintenanceDate: string
  nextDueDate: string
  severity: 'Critical' | 'Warning' | 'Info'
  status: 'Active' | 'Acknowledged' | 'Resolved'
  createdAt: string
}

async function handleGetAlerts(request: AuthenticatedRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || (user.role !== 'Operator' && user.role !== 'Admin')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get maintenance data from uploaded documents
    const maintenanceRecords = await trainDb
      .select()
      .from(documentDataRecords)
      .orderBy(desc(documentDataRecords.createdAt))

    let alerts: AlertData[] = []

    if (maintenanceRecords.length > 0) {
      // Process the uploaded maintenance data to generate alerts
      alerts = maintenanceRecords
        .map((record, index) => {
          try {
            const columnData = JSON.parse(record.columnData)
            
            // Skip header row (first record usually contains column names)
            if (record.rowIndex === 2 && columnData._0 === 'Train ID') {
              return null
            }
            
            // Map the column indices to their meanings based on CSV structure
            const trainId = columnData._0
            const lastMaintenanceDate = columnData._1
            const nextDueDate = columnData._2
            const maintenanceType = columnData._3
            const statusRaw = columnData._4
            const remarks = columnData._5
            
            // Skip if no train ID
            if (!trainId || trainId === 'Train ID') {
              return null
            }
            
            // Calculate days until maintenance
            const nextDue = new Date(nextDueDate)
            const today = new Date()
            const timeDiff = nextDue.getTime() - today.getTime()
            const daysUntilMaintenance = Math.ceil(timeDiff / (1000 * 3600 * 24))
            
            const generatedAlerts: AlertData[] = []
            
            // 1. Critical overdue alerts (🚨 High priority)
            if (daysUntilMaintenance < 0 || statusRaw === 'Overdue') {
              const daysOverdue = Math.abs(daysUntilMaintenance)
              generatedAlerts.push({
                id: index * 1000 + 1,
                trainId,
                type: 'critical',
                priority: 'High',
                title: `Critical: Overdue ${maintenanceType}`,
                description: `Train ${trainId} has overdue ${maintenanceType}. Immediate action required to prevent service disruption.`,
                daysOverdue,
                maintenanceType,
                lastMaintenanceDate,
                nextDueDate,
                severity: 'Critical',
                status: 'Active',
                createdAt: new Date().toISOString()
              })
            }
            
            // 2. Upcoming maintenance alerts (⚠️ Medium priority)
            if (daysUntilMaintenance > 0 && daysUntilMaintenance <= 30) {
              generatedAlerts.push({
                id: index * 1000 + 2,
                trainId,
                type: 'upcoming',
                priority: daysUntilMaintenance <= 7 ? 'High' : 'Medium',
                title: `Upcoming: ${maintenanceType} Due Soon`,
                description: `Train ${trainId} requires ${maintenanceType} in ${daysUntilMaintenance} days. Schedule maintenance to avoid delays.`,
                daysUntilDue: daysUntilMaintenance,
                maintenanceType,
                lastMaintenanceDate,
                nextDueDate,
                severity: daysUntilMaintenance <= 7 ? 'Warning' : 'Info',
                status: 'Active',
                createdAt: new Date().toISOString()
              })
            }
            
            // 3. System-generated AI alerts (predicted risks)
            // Generate AI predictions based on maintenance patterns
            if (maintenanceType.toLowerCase().includes('engine') || 
                maintenanceType.toLowerCase().includes('brake') ||
                maintenanceType.toLowerCase().includes('electrical')) {
              
              // Predict high-risk scenarios
              const riskFactors = []
              if (daysUntilMaintenance <= 14) riskFactors.push('approaching due date')
              if (maintenanceType.toLowerCase().includes('engine')) riskFactors.push('critical system component')
              if (statusRaw === 'Pending' && daysUntilMaintenance < 7) riskFactors.push('scheduling delay risk')
              
              if (riskFactors.length > 0) {
                let aiDescription = `AI analysis suggests elevated risk for Train ${trainId}. `
                if (maintenanceType.toLowerCase().includes('brake')) {
                  aiDescription += 'Brake system maintenance delays can impact safety and operational efficiency.'
                } else if (maintenanceType.toLowerCase().includes('engine')) {
                  aiDescription += 'Engine maintenance delays may lead to performance degradation and costly repairs.'
                } else if (maintenanceType.toLowerCase().includes('electrical')) {
                  aiDescription += 'Electrical system issues can cause service interruptions and safety concerns.'
                } else {
                  aiDescription += `${maintenanceType} requires attention to maintain optimal performance.`
                }
                
                generatedAlerts.push({
                  id: index * 1000 + 3,
                  trainId,
                  type: 'ai-predicted',
                  priority: riskFactors.length >= 2 ? 'Medium' : 'Low',
                  title: `AI Alert: Predicted Risk for ${maintenanceType}`,
                  description: aiDescription,
                  daysUntilDue: daysUntilMaintenance > 0 ? daysUntilMaintenance : undefined,
                  daysOverdue: daysUntilMaintenance < 0 ? Math.abs(daysUntilMaintenance) : undefined,
                  maintenanceType,
                  lastMaintenanceDate,
                  nextDueDate,
                  severity: riskFactors.length >= 2 ? 'Warning' : 'Info',
                  status: 'Active',
                  createdAt: new Date().toISOString()
                })
              }
            }
            
            return generatedAlerts
          } catch (error) {
            console.error('Error processing maintenance record for alerts:', error)
            return null
          }
        })
        .filter(item => item !== null)
        .flat() as AlertData[]
    }

    // Sort alerts by priority and severity
    alerts.sort((a, b) => {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 }
      const severityOrder = { 'Critical': 3, 'Warning': 2, 'Info': 1 }
      
      // First sort by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      // Then by severity
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
      if (severityDiff !== 0) return severityDiff
      
      // Finally by days overdue/due
      if (a.daysOverdue && b.daysOverdue) {
        return b.daysOverdue - a.daysOverdue
      }
      if (a.daysUntilDue && b.daysUntilDue) {
        return a.daysUntilDue - b.daysUntilDue
      }
      
      return 0
    })

    return NextResponse.json({
      success: true,
      data: alerts,
      count: alerts.length,
      summary: {
        critical: alerts.filter(a => a.type === 'critical').length,
        upcoming: alerts.filter(a => a.type === 'upcoming').length,
        aiPredicted: alerts.filter(a => a.type === 'ai-predicted').length,
        highPriority: alerts.filter(a => a.priority === 'High').length,
        mediumPriority: alerts.filter(a => a.priority === 'Medium').length,
        lowPriority: alerts.filter(a => a.priority === 'Low').length,
      }
    })

  } catch (error) {
    console.error('Error generating alerts:', error)
    return NextResponse.json(
      { error: 'Failed to generate alerts' },
      { status: 500 }
    )
  }
}

// Export the authenticated handler
export const GET = withAuth(handleGetAlerts)
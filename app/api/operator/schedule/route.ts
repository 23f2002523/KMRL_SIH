import { NextRequest, NextResponse } from 'next/server'
import { trainDb } from '@/lib/db/train-db'
import { documentDataRecords } from '@/lib/db/train-schema'
import { desc } from 'drizzle-orm'
import { withAuth, getCurrentUser, type AuthenticatedRequest } from '@/lib/auth-middleware'
import { addDays, format, parseISO, differenceInDays } from 'date-fns'

interface TrainData {
  trainId: string
  trainName: string
  lastMaintenanceDate: string
  nextMaintenanceDate: string
  status: string
  route?: string
  platform?: string
  systemHealth?: string
  brakeSystem?: string
  engineHealth?: string
  electricalSystem?: string
}

// Generate AI-based train schedules
function generateTrainSchedules(trainData: TrainData[]): any[] {
  const schedules: any[] = []
  const today = new Date()
  
  // Generate schedules for next 30 days
  for (let i = 0; i < 30; i++) {
    const scheduleDate = addDays(today, i)
    const isWeekend = scheduleDate.getDay() === 0 || scheduleDate.getDay() === 6
    
    trainData.forEach((train, index) => {
      // Skip if train is under maintenance
      if (train.status === 'Under Maintenance') {
        return
      }

      // Generate multiple daily schedules for each train
      const dailyRuns = isWeekend ? 2 : 4 // Fewer runs on weekends
      
      for (let run = 0; run < dailyRuns; run++) {
        const baseHour = 6 + (run * 4) + Math.floor(Math.random() * 2) // 6AM, 10AM, 2PM, 6PM with variance
        const departureTime = `${baseHour.toString().padStart(2, '0')}:${(Math.floor(Math.random() * 4) * 15).toString().padStart(2, '0')}`
        const arrivalTime = `${(baseHour + 2).toString().padStart(2, '0')}:${(Math.floor(Math.random() * 4) * 15).toString().padStart(2, '0')}`
        
        // Determine route based on train ID
        const routes = [
          'Aluva - Kochi Central',
          'Kochi Central - Aluva', 
          'Aluva - Kochi Airport',
          'Kochi Airport - Aluva',
          'Kochi Central - Maharajas College',
          'Maharajas College - Kochi Central'
        ]
        
        const route = routes[Math.floor(Math.random() * routes.length)]
        
        // AI-based status prediction
        let status = 'Active'
        const healthScore = getHealthScore(train)
        
        if (healthScore < 60) {
          status = Math.random() < 0.3 ? 'Delayed' : 'Active'
        } else if (healthScore < 40) {
          status = Math.random() < 0.5 ? 'Cancelled' : 'Delayed'
        }
        
        schedules.push({
          trainId: train.trainId,
          trainName: train.trainName || `Metro Train ${train.trainId}`,
          route,
          departureTime,
          arrivalTime,
          status,
          platform: `Platform ${Math.floor(Math.random() * 6) + 1}`,
          date: format(scheduleDate, 'yyyy-MM-dd')
        })
      }
    })
  }
  
  return schedules.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Generate AI-based maintenance windows
function generateMaintenanceWindows(trainData: TrainData[]): any[] {
  const maintenanceWindows: any[] = []
  const today = new Date()
  
  trainData.forEach(train => {
    const nextMaintenanceDate = parseISO(train.nextMaintenanceDate)
    const lastMaintenanceDate = parseISO(train.lastMaintenanceDate)
    const daysSinceLastMaintenance = differenceInDays(today, lastMaintenanceDate)
    const daysUntilNextMaintenance = differenceInDays(nextMaintenanceDate, today)
    
    // Current maintenance window if train is under maintenance
    if (train.status === 'Under Maintenance') {
      maintenanceWindows.push({
        id: `mw-${train.trainId}-current`,
        trainId: train.trainId,
        trainName: train.trainName || `Metro Train ${train.trainId}`,
        type: 'Corrective',
        scheduledDate: format(today, 'yyyy-MM-dd'),
        duration: '4-6 hours',
        priority: 'High',
        description: 'Ongoing corrective maintenance based on system diagnostics',
        status: 'In-Progress'
      })
    }
    
    // Scheduled preventive maintenance
    if (daysUntilNextMaintenance <= 30 && daysUntilNextMaintenance > 0) {
      let priority = 'Medium'
      if (daysUntilNextMaintenance <= 7) priority = 'High'
      if (daysUntilNextMaintenance <= 3) priority = 'High'
      
      maintenanceWindows.push({
        id: `mw-${train.trainId}-scheduled`,
        trainId: train.trainId,
        trainName: train.trainName || `Metro Train ${train.trainId}`,
        type: 'Preventive',
        scheduledDate: format(nextMaintenanceDate, 'yyyy-MM-dd'),
        duration: '2-3 hours',
        priority,
        description: `Scheduled preventive maintenance - ${daysSinceLastMaintenance} days since last service`,
        status: daysUntilNextMaintenance <= 0 ? 'Overdue' : 'Scheduled'
      })
    }
    
    // AI-suggested maintenance based on system health
    const healthScore = getHealthScore(train)
    if (healthScore < 70) {
      const urgencyDays = Math.max(1, Math.floor((healthScore - 30) / 10)) // Lower health = sooner maintenance
      const suggestedDate = addDays(today, urgencyDays)
      
      let priority = 'Medium'
      let description = 'AI-suggested maintenance based on system health analysis'
      
      if (healthScore < 50) {
        priority = 'High'
        description = 'Urgent AI-suggested maintenance - multiple systems showing degradation'
      } else if (healthScore < 60) {
        priority = 'High'
        description = 'AI-suggested maintenance - system health below optimal threshold'
      }
      
      // Identify specific systems needing attention
      const systemIssues = []
      if (parseFloat(train.brakeSystem || '100') < 70) systemIssues.push('brake system')
      if (parseFloat(train.engineHealth || '100') < 70) systemIssues.push('engine')
      if (parseFloat(train.electricalSystem || '100') < 70) systemIssues.push('electrical system')
      
      if (systemIssues.length > 0) {
        description += `. Focus areas: ${systemIssues.join(', ')}`
      }
      
      maintenanceWindows.push({
        id: `mw-${train.trainId}-ai`,
        trainId: train.trainId,
        trainName: train.trainName || `Metro Train ${train.trainId}`,
        type: 'AI-Suggested',
        scheduledDate: format(suggestedDate, 'yyyy-MM-dd'),
        duration: '3-4 hours',
        priority,
        description,
        status: 'Scheduled'
      })
    }
    
    // Emergency maintenance for critical issues
    if (healthScore < 40) {
      maintenanceWindows.push({
        id: `mw-${train.trainId}-emergency`,
        trainId: train.trainId,
        trainName: train.trainName || `Metro Train ${train.trainId}`,
        type: 'Emergency',
        scheduledDate: format(addDays(today, 1), 'yyyy-MM-dd'),
        duration: '6-8 hours',
        priority: 'High',
        description: 'Emergency maintenance required - critical system health alert',
        status: 'Scheduled'
      })
    }
  })
  
  return maintenanceWindows.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
}

// Calculate overall health score
function getHealthScore(train: TrainData): number {
  const brakeHealth = parseFloat(train.brakeSystem || '100')
  const engineHealth = parseFloat(train.engineHealth || '100')
  const electricalHealth = parseFloat(train.electricalSystem || '100')
  const systemHealth = parseFloat(train.systemHealth || '100')
  
  return (brakeHealth + engineHealth + electricalHealth + systemHealth) / 4
}

async function handleGetSchedule(request: AuthenticatedRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || user.role !== 'Operator') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get uploaded train maintenance data
    const maintenanceRecords = await trainDb
      .select()
      .from(documentDataRecords)
      .orderBy(desc(documentDataRecords.createdAt))

    let trainData: TrainData[] = []

    if (maintenanceRecords.length > 0) {
      // Process the uploaded maintenance data
      maintenanceRecords.forEach((record) => {
        try {
          const columnData = JSON.parse(record.columnData)
          
          // Skip header row (first record usually contains column names)
          if (record.rowIndex === 2 && columnData._0 === 'Train ID') {
            return
          }

          // Map the columns to train data
          const trainId = columnData._0 || 'Unknown'
          const trainName = columnData._1 || `Metro Train ${trainId}`
          const lastMaintenanceDate = columnData._2 || '2024-01-01'
          const nextMaintenanceDate = columnData._3 || '2024-12-31'
          const status = columnData._4 || 'Active'
          const systemHealth = columnData._5 || '100'
          const brakeSystem = columnData._6 || '100'
          const engineHealth = columnData._7 || '100'
          const electricalSystem = columnData._8 || '100'

          if (trainId && trainId !== 'Unknown') {
            trainData.push({
              trainId,
              trainName,
              lastMaintenanceDate,
              nextMaintenanceDate,
              status,
              systemHealth,
              brakeSystem,
              engineHealth,
              electricalSystem
            })
          }
        } catch (parseError) {
          console.error('Error parsing maintenance record:', parseError)
        }
      })
    }

    // If no data found, generate sample data for demonstration
    if (trainData.length === 0) {
      trainData = [
        {
          trainId: 'T101',
          trainName: 'Metro Express 101',
          lastMaintenanceDate: '2024-09-15',
          nextMaintenanceDate: '2024-10-15',
          status: 'Active',
          systemHealth: '85',
          brakeSystem: '90',
          engineHealth: '80',
          electricalSystem: '85'
        },
        {
          trainId: 'T102',
          trainName: 'Metro Express 102',
          lastMaintenanceDate: '2024-09-10',
          nextMaintenanceDate: '2024-10-20',
          status: 'Active',
          systemHealth: '92',
          brakeSystem: '95',
          engineHealth: '88',
          electricalSystem: '94'
        },
        {
          trainId: 'T103',
          trainName: 'Metro Express 103',
          lastMaintenanceDate: '2024-08-25',
          nextMaintenanceDate: '2024-09-25',
          status: 'Under Maintenance',
          systemHealth: '45',
          brakeSystem: '40',
          engineHealth: '50',
          electricalSystem: '45'
        }
      ]
    }

    // Generate AI-based schedules and maintenance windows
    const trainSchedules = generateTrainSchedules(trainData)
    const maintenanceWindows = generateMaintenanceWindows(trainData)

    return NextResponse.json({
      success: true,
      trainSchedules,
      maintenanceWindows,
      totalTrains: trainData.length,
      activeTrains: trainData.filter(t => t.status === 'Active').length,
      maintenanceTrains: trainData.filter(t => t.status === 'Under Maintenance').length,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in schedule API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule data' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handleGetSchedule)
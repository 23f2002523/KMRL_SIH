import { NextRequest, NextResponse } from 'next/server'
import { trainDb } from '@/lib/db/train-db'
import { documentDataRecords } from '@/lib/db/train-schema'
import { desc } from 'drizzle-orm'
import { withAuth, getCurrentUser, type AuthenticatedRequest } from '@/lib/auth-middleware'
import { addDays, format, startOfDay, endOfDay, parseISO } from 'date-fns'

interface Shift {
  id: string
  operatorId: string
  operatorName: string
  startTime: string
  endTime: string
  status: 'Scheduled' | 'Active' | 'Completed' | 'Missed'
  position: string
  location: string
  trainsAssigned: string[]
  notes?: string
}

interface ShiftHandover {
  id: string
  fromOperator: string
  toOperator: string
  shiftDate: string
  handoverTime: string
  status: 'Pending' | 'Completed' | 'Issues'
  trainsStatus: string
  maintenanceNotes: string
  issuesReported: string[]
  nextShiftPriorities: string[]
}

interface ShiftReport {
  id: string
  operatorId: string
  operatorName: string
  shiftDate: string
  startTime: string
  endTime: string
  trainsOperated: string[]
  incidentsReported: number
  maintenanceIssues: string[]
  performanceNotes: string
  status: 'Draft' | 'Submitted' | 'Approved'
}

// Generate shift schedules based on real train maintenance data
function generateShiftSchedules(trainData: any[]): Shift[] {
  const shifts: Shift[] = []
  const today = new Date()
  
  // Operator shift patterns
  const operators = [
    { id: 'operator@kmrl.co.in', name: 'Train Operator', position: 'Senior Operator' },
    { id: 'operator2@kmrl.co.in', name: 'Operator B', position: 'Junior Operator' },
    { id: 'operator3@kmrl.co.in', name: 'Operator C', position: 'Senior Operator' },
  ]
  
  const locations = ['Aluva Station', 'Kochi Central', 'Maharajas College', 'Kochi Airport']
  const shiftPatterns = [
    { start: '06:00', end: '14:00' }, // Morning shift
    { start: '14:00', end: '22:00' }, // Evening shift
    { start: '22:00', end: '06:00' }, // Night shift
  ]
  
  // Get active trains and maintenance trains from real data
  const activeTrains = trainData.filter(train => train.status === 'Active' || train.status === 'Operational')
  const maintenanceTrains = trainData.filter(train => train.status === 'Under Maintenance' || train.status === 'Maintenance')
  
  // Generate shifts for the next 7 days
  for (let day = 0; day < 7; day++) {
    const shiftDate = addDays(today, day)
    
    operators.forEach((operator, operatorIndex) => {
      shiftPatterns.forEach((pattern, patternIndex) => {
        // Rotate operators across shifts
        const shouldSchedule = (operatorIndex + patternIndex + day) % 3 === 0
        
        if (shouldSchedule) {
          const startDateTime = new Date(shiftDate)
          const [startHour, startMinute] = pattern.start.split(':').map(Number)
          startDateTime.setHours(startHour, startMinute, 0, 0)
          
          const endDateTime = new Date(shiftDate)
          const [endHour, endMinute] = pattern.end.split(':').map(Number)
          endDateTime.setHours(endHour, endMinute, 0, 0)
          
          // Handle overnight shifts
          if (endHour < startHour) {
            endDateTime.setDate(endDateTime.getDate() + 1)
          }
          
          // Determine status based on current time
          let status: Shift['status'] = 'Scheduled'
          const now = new Date()
          
          if (now >= startDateTime && now <= endDateTime) {
            status = 'Active'
          } else if (now > endDateTime) {
            status = 'Completed'
          }
          
          // Assign real trains based on availability and operator specialization
          let trainsAssigned: string[] = []
          
          if (activeTrains.length > 0) {
            // Assign active trains to operators
            const operatorActiveTrains = activeTrains
              .filter((_, trainIndex) => trainIndex % operators.length === operatorIndex)
              .slice(0, 2)
              .map(train => train.trainId)
            trainsAssigned.push(...operatorActiveTrains)
          }
          
          // Senior operators also handle maintenance trains
          if (operator.position === 'Senior Operator' && maintenanceTrains.length > 0) {
            const maintenanceAssigned = maintenanceTrains
              .filter((_, trainIndex) => trainIndex % 2 === operatorIndex % 2)
              .slice(0, 1)
              .map(train => train.trainId)
            trainsAssigned.push(...maintenanceAssigned)
          }
          
          // Fallback to default train IDs if no real data
          if (trainsAssigned.length === 0) {
            trainsAssigned = [
              `T10${(operatorIndex + 1)}`,
              `T10${(operatorIndex + 4)}`,
            ]
          }
          
          shifts.push({
            id: `shift-${operator.id}-${day}-${patternIndex}`,
            operatorId: operator.id,
            operatorName: operator.name,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            status,
            position: operator.position,
            location: locations[operatorIndex % locations.length],
            trainsAssigned,
            notes: day === 0 && status === 'Active' ? `Currently managing ${trainsAssigned.join(', ')}` : undefined
          })
        }
      })
    })
  }
  
  return shifts.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
}

// Generate shift handovers
function generateShiftHandovers(trainData: any[]): ShiftHandover[] {
  const handovers: ShiftHandover[] = []
  const today = new Date()
  
  // Generate handovers for the last 5 days
  for (let day = -5; day < 0; day++) {
    const handoverDate = addDays(today, day)
    
    handovers.push({
      id: `handover-${Math.abs(day)}`,
      fromOperator: day % 2 === 0 ? 'Train Operator' : 'Operator B',
      toOperator: day % 2 === 0 ? 'Operator C' : 'Train Operator',
      shiftDate: format(handoverDate, 'yyyy-MM-dd'),
      handoverTime: new Date(handoverDate.getTime() + 14 * 60 * 60 * 1000).toISOString(),
      status: trainData.some(train => parseFloat(train.systemHealth || '100') < 70) ? 'Issues' : 'Completed',
      trainsStatus: `${trainData.filter(t => t.status === 'Active').length} trains operational, ${trainData.filter(t => t.status === 'Under Maintenance').length} in maintenance`,
      maintenanceNotes: trainData.find(train => train.status === 'Under Maintenance') ? 
        `${trainData.find(train => train.status === 'Under Maintenance')?.trainId}: System health at ${trainData.find(train => train.status === 'Under Maintenance')?.systemHealth}%` : 
        'No maintenance issues reported',
      issuesReported: Math.abs(day) === 1 ? ['Delayed departure from Aluva by 5 minutes'] : [],
      nextShiftPriorities: [
        'Monitor T101 brake system',
        'Complete scheduled maintenance check',
        'Brief incoming shift on route changes'
      ]
    })
  }
  
  return handovers.reverse() // Most recent first
}

// Generate shift reports
function generateShiftReports(operatorEmail: string): ShiftReport[] {
  const reports: ShiftReport[] = []
  const today = new Date()
  
  // Generate reports for the last 7 days
  for (let day = -7; day < 0; day++) {
    const reportDate = addDays(today, day)
    
    const statuses: ShiftReport['status'][] = ['Submitted', 'Approved', 'Draft']
    const status = statuses[Math.abs(day) % statuses.length]
    
    reports.push({
      id: `report-${operatorEmail}-${Math.abs(day)}`,
      operatorId: operatorEmail,
      operatorName: 'Train Operator',
      shiftDate: format(reportDate, 'yyyy-MM-dd'),
      startTime: new Date(reportDate.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(reportDate.getTime() + 14 * 60 * 60 * 1000).toISOString(),
      trainsOperated: [`T10${Math.abs(day) % 3 + 1}`, `T10${Math.abs(day) % 3 + 4}`],
      incidentsReported: Math.abs(day) === 2 ? 1 : 0,
      maintenanceIssues: Math.abs(day) === 3 ? ['Brake system inspection required'] : [],
      performanceNotes: `Shift completed successfully. ${Math.abs(day) === 1 ? 'Minor delay due to passenger boarding issues.' : 'All operations ran smoothly.'}`,
      status
    })
  }
  
  return reports.reverse() // Most recent first
}

async function handleGetShifts(request: AuthenticatedRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || (user.role !== 'Operator' && user.role !== 'Admin')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get uploaded train maintenance data
    const maintenanceRecords = await trainDb
      .select()
      .from(documentDataRecords)
      .orderBy(desc(documentDataRecords.createdAt))

    let trainData: any[] = []

    if (maintenanceRecords.length > 0) {
      // Process the uploaded maintenance data
      maintenanceRecords.forEach((record) => {
        try {
          const columnData = JSON.parse(record.columnData)
          
          // Skip header row
          if (record.rowIndex === 2 && columnData._0 === 'Train ID') {
            return
          }

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

    // If no data found, use sample data
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

    // Generate shift data based on real train data
    const currentShifts = generateShiftSchedules(trainData)
    const shiftHandovers = generateShiftHandovers(trainData)
    const shiftReports = generateShiftReports(user.email)

    // Filter shifts for today and upcoming
    const today = startOfDay(new Date())
    const todayShifts = currentShifts.filter(shift => {
      const shiftDate = startOfDay(parseISO(shift.startTime))
      return shiftDate >= today
    })

    return NextResponse.json({
      success: true,
      currentShifts: todayShifts,
      shiftHandovers,
      shiftReports,
      totalOperators: 3,
      activeShifts: currentShifts.filter(s => s.status === 'Active').length,
      completedShifts: currentShifts.filter(s => s.status === 'Completed').length,
      pendingHandovers: shiftHandovers.filter(h => h.status === 'Pending').length,
      operationalData: trainData.length,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in shifts API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shift data' },
      { status: 500 }
    )
  }
}

// Handle shift handover submission
async function handlePostHandover(request: AuthenticatedRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || (user.role !== 'Operator' && user.role !== 'Admin')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    
    // In a real app, save handover to database
    console.log('Handover submission:', {
      fromOperator: user.email,
      ...body,
      submittedAt: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Handover submitted successfully',
      handoverId: `handover-${Date.now()}`
    })

  } catch (error) {
    console.error('Error submitting handover:', error)
    return NextResponse.json(
      { error: 'Failed to submit handover' },
      { status: 500 }
    )
  }
}

// Handle shift report submission
async function handlePostReport(request: AuthenticatedRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || (user.role !== 'Operator' && user.role !== 'Admin')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    
    // In a real app, save report to database
    console.log('Shift report submission:', {
      operatorId: user.email,
      operatorName: user.name,
      ...body,
      status: 'Submitted',
      submittedAt: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Shift report submitted successfully',
      reportId: `report-${Date.now()}`
    })

  } catch (error) {
    console.error('Error submitting shift report:', error)
    return NextResponse.json(
      { error: 'Failed to submit shift report' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handleGetShifts)
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  if (action === 'handover') {
    return handlePostHandover(request)
  } else if (action === 'report') {
    return handlePostReport(request)
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
})
import { NextRequest, NextResponse } from 'next/server'
import { trainDb } from '@/lib/db/train-db'
import { trainsets, jobCards, documentDataRecords } from '@/lib/db/train-schema'
import { eq, desc } from 'drizzle-orm'
import { withAuth, getCurrentUser, type AuthenticatedRequest } from '@/lib/auth-middleware'

interface TrainMaintenanceData {
  trainsetId: number
  trainId: string
  lastMaintenanceDate: string
  nextMaintenanceDate: string
  maintenanceType: string
  status: 'In Service' | 'Under Maintenance' | 'Idle'
  healthStatus: 'Good' | 'Due Soon' | 'Critical'
  daysUntilMaintenance: number
  operatorAssigned: string
  remarks: string
}

async function handleGetTrains(request: AuthenticatedRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || user.role !== 'Operator') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // First, try to get maintenance data from uploaded documents
    // Check both 'maintenance' and 'generic' data types (some uploads might be classified as generic)
    const maintenanceRecords = await trainDb
      .select()
      .from(documentDataRecords)
      .orderBy(desc(documentDataRecords.createdAt))

    let trainMaintenanceData: TrainMaintenanceData[] = []

    if (maintenanceRecords.length > 0) {
      // Parse the uploaded maintenance data
      trainMaintenanceData = maintenanceRecords
        .map((record) => {
          try {
            const columnData = JSON.parse(record.columnData)
            
            // Skip header row (first record usually contains column names)
            if (record.rowIndex === 2 && columnData._0 === 'Train ID') {
              return null
            }
            
            // Map the column indices to their meanings based on CSV structure
            // _0: Train ID, _1: Last Maintenance Date, _2: Next Due Date, _3: Maintenance Type, _4: Status, _5: Remarks
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
            
            // Determine health status based on days until maintenance
            let healthStatus: 'Good' | 'Due Soon' | 'Critical' = 'Good'
            if (daysUntilMaintenance < 0) {
              healthStatus = 'Critical'
            } else if (daysUntilMaintenance <= 30) {
              healthStatus = 'Due Soon'
            }
            
            // Map status from uploaded data
            let status: 'In Service' | 'Under Maintenance' | 'Idle' = 'In Service'
            if (statusRaw === 'In Progress' || statusRaw === 'Under Maintenance') {
              status = 'Under Maintenance'
            } else if (statusRaw === 'Completed') {
              status = 'In Service'
            } else if (statusRaw === 'Cancelled') {
              status = 'Idle'
            } else if (statusRaw === 'Overdue') {
              status = 'Under Maintenance' // Overdue items should be in maintenance
            }

            return {
              trainsetId: record.recordId || 0,
              trainId: trainId,
              lastMaintenanceDate: lastMaintenanceDate || '',
              nextMaintenanceDate: nextDueDate || '',
              maintenanceType: maintenanceType || 'General Maintenance',
              status,
              healthStatus,
              daysUntilMaintenance,
              operatorAssigned: 'System User',
              remarks: remarks || ''
            }
          } catch (error) {
            console.error('Error parsing maintenance record:', error)
            return null
          }
        })
        .filter((item): item is TrainMaintenanceData => item !== null)
    }

    // If no uploaded maintenance data, try to get from job cards and trainsets
    if (trainMaintenanceData.length === 0) {
      const jobCardData = await trainDb
        .select({
          trainsetId: trainsets.trainsetId,
          serialNo: trainsets.serialNo,
          status: trainsets.status,
          lastServiceDate: trainsets.lastServiceDate,
          mileageKm: trainsets.mileageKm,
          jobCardDescription: jobCards.description,
          jobCardStatus: jobCards.status,
          jobCardRaisedDate: jobCards.raisedDate,
          jobCardClosedDate: jobCards.closedDate,
        })
        .from(trainsets)
        .leftJoin(jobCards, eq(trainsets.trainsetId, jobCards.trainsetId))
        .orderBy(desc(trainsets.updatedAt))

      trainMaintenanceData = jobCardData.map((record) => {
        const nextMaintenanceDate = new Date()
        nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + 90) // Default 90 days from now

        const lastMaintenanceDate = record.lastServiceDate || new Date()
        const timeDiff = nextMaintenanceDate.getTime() - new Date().getTime()
        const daysUntilMaintenance = Math.ceil(timeDiff / (1000 * 3600 * 24))

        let healthStatus: 'Good' | 'Due Soon' | 'Critical' = 'Good'
        if (daysUntilMaintenance < 0) {
          healthStatus = 'Critical'
        } else if (daysUntilMaintenance <= 30) {
          healthStatus = 'Due Soon'
        }

        let status: 'In Service' | 'Under Maintenance' | 'Idle' = 'In Service'
        if (record.status === 'Maintenance') {
          status = 'Under Maintenance'
        } else if (record.status === 'Standby') {
          status = 'Idle'
        }

        return {
          trainsetId: record.trainsetId,
          trainId: record.serialNo,
          lastMaintenanceDate: lastMaintenanceDate.toISOString().split('T')[0],
          nextMaintenanceDate: nextMaintenanceDate.toISOString().split('T')[0],
          maintenanceType: record.jobCardDescription || 'General Maintenance',
          status,
          healthStatus,
          daysUntilMaintenance,
          operatorAssigned: 'System User',
          remarks: ''
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: trainMaintenanceData,
      source: maintenanceRecords.length > 0 ? 'uploaded_documents' : 'job_cards',
      count: trainMaintenanceData.length
    })

  } catch (error) {
    console.error('Error fetching train maintenance data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch train maintenance data' },
      { status: 500 }
    )
  }
}

// Export the authenticated handler
export const GET = withAuth(handleGetTrains)
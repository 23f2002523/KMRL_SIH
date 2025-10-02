import { NextRequest } from 'next/server'
import { withOperatorRole } from '@/lib/auth-middleware'
import { withLogging } from '@/lib/logger'
import { ApiResponseBuilder } from '@/lib/api-response'
import type { AuthenticatedRequest } from '@/lib/auth-middleware'

// POST /api/operator/train-control - Control train operations (Operator+ only)
async function trainControlHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json()
    const { action, trainId, parameters } = body
    
    if (!action || !trainId) {
      return ApiResponseBuilder.validationError('Action and trainId are required')
    }
    
    // Simulate train control operations
    const allowedActions = ['start', 'stop', 'emergency_stop', 'change_speed', 'change_route']
    
    if (!allowedActions.includes(action)) {
      return ApiResponseBuilder.validationError(`Invalid action. Allowed: ${allowedActions.join(', ')}`)
    }
    
    // Log the operation (in real system, this would interface with train control systems)
    console.log(`Train Control Operation:`, {
      action,
      trainId,
      parameters,
      operator: request.user?.email,
      timestamp: new Date().toISOString()
    })
    
    // Simulate different responses based on action
    let responseData: any = {
      trainId,
      action,
      status: 'success',
      timestamp: new Date().toISOString(),
      operatedBy: request.user?.email,
      operatorRole: request.user?.role
    }
    
    switch (action) {
      case 'start':
        responseData = { ...responseData, message: 'Train started successfully', currentSpeed: '0 km/h' }
        break
      case 'stop':
        responseData = { ...responseData, message: 'Train stopped successfully', currentSpeed: '0 km/h' }
        break
      case 'emergency_stop':
        responseData = { ...responseData, message: 'Emergency stop activated', currentSpeed: '0 km/h', alert: 'Emergency protocols activated' }
        break
      case 'change_speed':
        const newSpeed = parameters?.speed || '60 km/h'
        responseData = { ...responseData, message: `Speed changed to ${newSpeed}`, currentSpeed: newSpeed }
        break
      case 'change_route':
        const newRoute = parameters?.route || 'Route A'
        responseData = { ...responseData, message: `Route changed to ${newRoute}`, currentRoute: newRoute }
        break
    }
    
    return ApiResponseBuilder.success(responseData, `Train control operation completed: ${action}`)
    
  } catch (error) {
    console.error('Train control error:', error)
    return ApiResponseBuilder.serverError('Train control operation failed')
  }
}

// GET /api/operator/train-status - Get train status (Operator+ only)
async function getTrainStatusHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trainId = searchParams.get('trainId')
    
    // Simulate train status data
    const mockTrainStatus = {
      trainId: trainId || 'TRAIN-001',
      status: 'operational',
      currentSpeed: '75 km/h',
      currentRoute: 'Kochi - Aluva',
      nextStation: 'Edappally',
      passengerCount: 145,
      lastMaintenance: '2025-09-28',
      operator: request.user?.email,
      coordinates: { lat: 10.0261, lng: 76.3125 },
      alerts: [],
      systemHealth: {
        engine: 'good',
        brakes: 'good',
        doors: 'good',
        airConditioning: 'good',
        communication: 'good'
      }
    }
    
    return ApiResponseBuilder.success(mockTrainStatus, 'Train status retrieved successfully')
    
  } catch (error) {
    console.error('Error getting train status:', error)
    return ApiResponseBuilder.serverError('Failed to get train status')
  }
}

export const POST = withLogging(withOperatorRole(trainControlHandler))
export const GET = withLogging(withOperatorRole(getTrainStatusHandler))
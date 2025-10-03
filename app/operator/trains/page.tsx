"use client"

import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Train, AlertTriangle, CheckCircle, Clock, Wrench, Search, RefreshCw, Eye } from 'lucide-react'

interface TrainData {
  trainsetId: number
  trainId: string
  lastMaintenanceDate: string
  nextMaintenanceDate: string
  maintenanceType: string
  status: 'In Service' | 'Under Maintenance' | 'Idle'
  healthStatus: 'Good' | 'Due Soon' | 'Critical'
  daysUntilMaintenance: number
  operatorAssigned?: string
}

export default function OperatorTrainsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [trains, setTrains] = useState<TrainData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (user?.role !== 'Operator' && user?.role !== 'Admin') {
      console.log('User role check failed:', user?.role)
      router.push('/login?error=unauthorized')
      return
    }

    console.log('Fetching train maintenance data for user:', user?.email, 'Role:', user?.role)
    fetchTrainMaintenanceData()
  }, [isAuthenticated, user, router])

  const fetchTrainMaintenanceData = async () => {
    try {
      setLoading(true)
      
      // Check for auth token with the correct key name
      let token = localStorage.getItem('kmrl-auth-token') || localStorage.getItem('authToken')
      console.log('Token found:', !!token)
      
      // If no token but user is authenticated, try to get a token
      if (!token && user && isAuthenticated) {
        console.log('No token but user authenticated, getting debug token...')
        try {
          const tokenResponse = await fetch('/api/auth/debug-token', {
            credentials: 'include'
          })
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json()
            if (tokenData.success && tokenData.token) {
              token = tokenData.token
              localStorage.setItem('kmrl-auth-token', tokenData.token)
              console.log('✅ Got debug token for user')
            }
          }
        } catch (error) {
          console.log('Failed to get debug token:', error)
        }
      }
      
      // Prepare request options - use both token and cookies for auth
      const fetchOptions: RequestInit = {
        method: 'GET',
        credentials: 'include', // Include cookies for cookie-based auth
        headers: {
          'Content-Type': 'application/json',
        },
      }
      
      // Add token to headers if available
      if (token) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          'Authorization': `Bearer ${token}`,
        }
      }

      console.log('Making API call to /api/operator/trains with options:', {
        hasToken: !!token,
        hasCredentials: fetchOptions.credentials
      })
      
      const response = await fetch('/api/operator/trains', fetchOptions)

      console.log('API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error:', response.status, errorText)
        throw new Error(`Failed to fetch train maintenance data: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      console.log('API result:', result)
      
      if (result.success && result.data) {
        setTrains(result.data)
        console.log(`✅ Loaded ${result.count} train maintenance records from ${result.source}`)
      } else {
        console.error('API returned no data, using empty array')
        setTrains([])
      }
    } catch (error) {
      console.error('❌ Error fetching train maintenance data:', error)
      // On error, show empty state rather than mock data
      setTrains([])
    } finally {
      setLoading(false)
    }
  }

  if (!user || (user.role !== 'Operator' && user.role !== 'Admin')) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Current user: {user ? `${user.email} (${user.role})` : 'Not logged in'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              This page requires Operator or Admin role access.
            </p>
            <Button onClick={() => router.push('/login')} variant="outline" size="sm">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Train className="h-5 w-5" />
              My Trains
            </CardTitle>
            <CardDescription>Loading train maintenance data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Train className="h-8 w-8 text-blue-600" />
            My Trains
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your assigned trains maintenance status and schedules from uploaded Train_maintenance data
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Debug: User: {user?.email} | Role: {user?.role} | Authenticated: {isAuthenticated ? 'Yes' : 'No'}
          </p>
        </div>
        <Button onClick={fetchTrainMaintenanceData} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Trains</p>
                <p className="text-2xl font-bold">{trains.length}</p>
              </div>
              <Train className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Service</p>
                <p className="text-2xl font-bold text-blue-600">
                  {trains.filter(t => t.status === 'In Service').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {trains.filter(t => t.healthStatus === 'Critical').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Train List</CardTitle>
          <CardDescription>
            {trains.length > 0 
              ? `Showing ${trains.length} trains from your uploaded Train_maintenance excel data`
              : 'No train maintenance data found. Check browser console for API errors or login with operator@kmrl.co.in'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trains.map((train) => (
              <div 
                key={train.trainsetId} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {train.healthStatus === 'Good' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {train.healthStatus === 'Due Soon' && <Clock className="h-4 w-4 text-yellow-600" />}
                  {train.healthStatus === 'Critical' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-lg font-semibold">{train.trainId}</span>
                      
                      {train.status === 'In Service' && (
                        <Badge className="bg-blue-100 text-blue-800">In Service</Badge>
                      )}
                      {train.status === 'Under Maintenance' && (
                        <Badge className="bg-orange-100 text-orange-800">Under Maintenance</Badge>
                      )}
                      {train.status === 'Idle' && (
                        <Badge className="bg-gray-100 text-gray-800">Idle</Badge>
                      )}
                      
                      {train.healthStatus === 'Good' && (
                        <Badge className="bg-green-100 text-green-800">Good</Badge>
                      )}
                      {train.healthStatus === 'Due Soon' && (
                        <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>
                      )}
                      {train.healthStatus === 'Critical' && (
                        <Badge className="bg-red-100 text-red-800">Critical</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{train.maintenanceType}</span>
                      {train.operatorAssigned && (
                        <span> • Assigned to: {train.operatorAssigned}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium mb-1">
                    Last: {new Date(train.lastMaintenanceDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-medium mb-1">
                    Next: {new Date(train.nextMaintenanceDate).toLocaleDateString()}
                  </div>
                  <div className={`text-xs ${
                    train.daysUntilMaintenance < 0 ? 'text-red-600 font-semibold' :
                    train.daysUntilMaintenance <= 30 ? 'text-yellow-600 font-medium' : 
                    'text-muted-foreground'
                  }`}>
                    {train.daysUntilMaintenance < 0 
                      ? `${Math.abs(train.daysUntilMaintenance)} days overdue`
                      : `${train.daysUntilMaintenance} days remaining`
                    }
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant={train.healthStatus === 'Critical' ? 'destructive' : 'default'}
                  >
                    <Wrench className="h-4 w-4 mr-1" />
                    {train.status === 'Under Maintenance' ? 'Update' : 'Schedule'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
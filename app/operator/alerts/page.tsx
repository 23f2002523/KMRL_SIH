"use client"

import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertTriangle, Clock, Zap, Search, RefreshCw, Bell, X } from 'lucide-react'

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

export default function OperatorAlertsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'upcoming' | 'ai-predicted'>('all')

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

    console.log('Fetching alerts data for user:', user?.email, 'Role:', user?.role)
    fetchAlertsData()
  }, [isAuthenticated, user, router])

  const fetchAlertsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
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

      console.log('Making API call to /api/operator/alerts')
      const response = await fetch('/api/operator/alerts', fetchOptions)

      console.log('API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error:', response.status, errorText)
        throw new Error(`Failed to fetch alerts data: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      console.log('API result:', result)
      
      if (result.success && result.data) {
        setAlerts(result.data)
        setFilteredAlerts(result.data)
        console.log(`✅ Loaded ${result.data.length} alerts from maintenance data`)
      } else {
        console.error('API returned no data, using empty array')
        setAlerts([])
        setFilteredAlerts([])
      }
    } catch (error) {
      console.error('❌ Error fetching alerts data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load alerts')
      setAlerts([])
      setFilteredAlerts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = alerts

    if (searchTerm) {
      filtered = filtered.filter(alert => 
        alert.trainId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.maintenanceType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(alert => alert.type === filterType)
    }

    setFilteredAlerts(filtered)
  }, [alerts, searchTerm, filterType])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'upcoming':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'ai-predicted':
        return <Zap className="h-5 w-5 text-blue-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">🚨 Critical</Badge>
      case 'Warning':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">⚠️ Warning</Badge>
      case 'Info':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">ℹ️ Info</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>
      case 'Medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>
      case 'Low':
        return <Badge className="bg-green-100 text-green-800">Low Priority</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getAlertCounts = () => {
    return {
      total: alerts.length,
      critical: alerts.filter(a => a.type === 'critical').length,
      upcoming: alerts.filter(a => a.type === 'upcoming').length,
      aiPredicted: alerts.filter(a => a.type === 'ai-predicted').length,
      active: alerts.filter(a => a.status === 'Active').length,
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
              <Bell className="h-5 w-5" />
              Active Alerts
            </CardTitle>
            <CardDescription>Loading maintenance alerts...</CardDescription>
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

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Error Loading Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchAlertsData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = getAlertCounts()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-red-600" />
            Active Alerts
          </h1>
          <p className="text-muted-foreground mt-1">
            Critical overdue alerts, upcoming maintenance warnings, and AI-predicted risks from Train_maintenance data
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Debug: User: {user?.email} | Role: {user?.role} | Authenticated: {isAuthenticated ? 'Yes' : 'No'}
          </p>
        </div>
        <Button onClick={fetchAlertsData} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Alerts
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Due</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.upcoming}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Predicted</p>
                <p className="text-2xl font-bold text-blue-600">{stats.aiPredicted}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Train ID, alert title, or maintenance type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'critical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('critical')}
              >
                Critical
              </Button>
              <Button
                variant={filterType === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('upcoming')}
              >
                Upcoming
              </Button>
              <Button
                variant={filterType === 'ai-predicted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('ai-predicted')}
              >
                AI Predicted
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <CardDescription className="mb-4">
            {filteredAlerts.length > 0 
              ? `Showing ${filteredAlerts.length} alerts generated from your uploaded Train_maintenance excel data`
              : 'No alerts found. Check browser console for API errors or ensure Train_maintenance data is uploaded.'
            }
          </CardDescription>
          
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No alerts found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search terms or filters' 
                  : 'All trains are within maintenance schedules'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                    alert.severity === 'Critical' ? 'border-red-200 bg-red-50/50' :
                    alert.severity === 'Warning' ? 'border-yellow-200 bg-yellow-50/50' :
                    'border-blue-200 bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold">{alert.trainId}</span>
                        {getSeverityBadge(alert.severity)}
                        {getPriorityBadge(alert.priority)}
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-1">{alert.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Maintenance Type: <span className="font-medium">{alert.maintenanceType}</span></div>
                        <div>Last Maintenance: <span className="font-medium">{new Date(alert.lastMaintenanceDate).toLocaleDateString()}</span></div>
                        <div>Next Due: <span className="font-medium">{new Date(alert.nextDueDate).toLocaleDateString()}</span></div>
                        {alert.daysOverdue && (
                          <div className="text-red-600 font-semibold">
                            🚨 {alert.daysOverdue} days overdue!
                          </div>
                        )}
                        {alert.daysUntilDue && (
                          <div className={alert.daysUntilDue <= 7 ? 'text-yellow-600 font-medium' : 'text-muted-foreground'}>
                            ⏰ Due in {alert.daysUntilDue} days
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      Acknowledge
                    </Button>
                    <Button 
                      size="sm" 
                      variant={alert.severity === 'Critical' ? 'destructive' : 'default'}
                    >
                      Take Action
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
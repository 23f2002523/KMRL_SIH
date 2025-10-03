'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar,
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Train,
  Wrench,
  RefreshCw
} from 'lucide-react'

interface MaintenanceSchedule {
  trainsetId: number
  trainId: string
  predictedOverdueDate: Date
  daysUntilOverdue: number
  confidence: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommendation: string
  maintenanceType: string
}

interface StatusSummary {
  completed: number
  pending: number
  urgent: number
  overdue: number
  total: number
}

export default function AdminMaintenanceSchedule() {
  const [scheduleData, setScheduleData] = useState<MaintenanceSchedule[]>([])
  const [statusSummary, setStatusSummary] = useState<StatusSummary>({
    completed: 0, pending: 0, urgent: 0, overdue: 0, total: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table')

  const fetchMaintenanceData = async () => {
    try {
      setError(null)
      setLoading(true)
      
      const response = await fetch('/api/ai/maintenance', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data.predictions) {
        const predictions = result.data.predictions.map((p: any) => ({
          trainsetId: p.trainsetId,
          trainId: p.trainId,
          predictedOverdueDate: new Date(p.predictedOverdueDate),
          daysUntilOverdue: p.daysUntilOverdue,
          confidence: p.confidence,
          riskLevel: p.riskLevel,
          recommendation: p.recommendation,
          maintenanceType: extractMaintenanceType(p.recommendation)
        }))
        
        setScheduleData(predictions)
        
        // Calculate status summary
        const summary = {
          total: predictions.length,
          completed: predictions.filter((p: MaintenanceSchedule) => p.daysUntilOverdue > 30).length,
          pending: predictions.filter((p: MaintenanceSchedule) => p.daysUntilOverdue > 0 && p.daysUntilOverdue <= 30).length,
          urgent: predictions.filter((p: MaintenanceSchedule) => p.daysUntilOverdue <= 7 && p.daysUntilOverdue > 0).length,
          overdue: predictions.filter((p: MaintenanceSchedule) => p.daysUntilOverdue <= 0).length
        }
        setStatusSummary(summary)
      }
    } catch (error) {
      console.error('Failed to fetch maintenance data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load maintenance schedule')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaintenanceData()
  }, [])

  const extractMaintenanceType = (recommendation: string): string => {
    const types = ['Brake', 'Engine', 'Electrical', 'Coach', 'Routine', 'HVAC']
    for (const type of types) {
      if (recommendation.toLowerCase().includes(type.toLowerCase())) {
        return type
      }
    }
    return 'General'
  }

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'destructive'
      case 'HIGH': return 'secondary'
      case 'MEDIUM': return 'default'
      case 'LOW': return 'outline'
      default: return 'outline'
    }
  }

  const getRowClassName = (daysUntilOverdue: number, riskLevel: string) => {
    if (daysUntilOverdue <= 0 || riskLevel === 'CRITICAL') {
      return 'bg-red-50 border-red-200 hover:bg-red-100'
    }
    if (daysUntilOverdue <= 7 || riskLevel === 'HIGH') {
      return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
    }
    return 'hover:bg-gray-50'
  }

  const sortedScheduleData = [...scheduleData].sort((a, b) => a.daysUntilOverdue - b.daysUntilOverdue)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Maintenance Schedule
          </CardTitle>
          <CardDescription>Loading maintenance predictions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Error Loading Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchMaintenanceData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Maintenance Schedule</h2>
          <p className="text-muted-foreground">
            AI-powered maintenance forecasting and scheduling
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </Button>
          <Button onClick={fetchMaintenanceData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{statusSummary.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgent (≤7 days)</p>
                <p className="text-2xl font-bold text-yellow-600">{statusSummary.urgent}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{statusSummary.pending}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Schedule</p>
                <p className="text-2xl font-bold text-green-600">{statusSummary.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Schedule View */}
      {viewMode === 'table' ? (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Maintenance Schedule</CardTitle>
            <CardDescription>
              Trains sorted by maintenance priority (overdue trains highlighted in red)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Train ID</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Due Date</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Risk Level</th>
                    <th className="text-left p-3 font-medium">Confidence</th>
                    <th className="text-left p-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedScheduleData.map((item, index) => (
                    <tr key={index} className={`border-b ${getRowClassName(item.daysUntilOverdue, item.riskLevel)}`}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Train className="h-4 w-4" />
                          <span className="font-medium">{item.trainId}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{item.maintenanceType}</Badge>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="text-sm font-medium">
                            {item.predictedOverdueDate.toLocaleDateString()}
                          </div>
                          <div className={`text-xs ${
                            item.daysUntilOverdue <= 0 ? 'text-red-600 font-medium' :
                            item.daysUntilOverdue <= 7 ? 'text-yellow-600' : 'text-muted-foreground'
                          }`}>
                            {item.daysUntilOverdue <= 0 
                              ? `${Math.abs(item.daysUntilOverdue)} days overdue`
                              : `${item.daysUntilOverdue} days remaining`
                            }
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {item.daysUntilOverdue <= 0 ? (
                          <Badge variant="destructive">Overdue</Badge>
                        ) : item.daysUntilOverdue <= 7 ? (
                          <Badge variant="secondary">Urgent</Badge>
                        ) : item.daysUntilOverdue <= 30 ? (
                          <Badge variant="default">Pending</Badge>
                        ) : (
                          <Badge variant="outline">Scheduled</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant={getRiskBadgeColor(item.riskLevel)}>
                          {item.riskLevel}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{item.confidence}%</div>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${item.confidence}%`}}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="outline">
                          Schedule
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Calendar View (Simple implementation)
        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>Monthly maintenance schedule overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedScheduleData.slice(0, 12).map((item, index) => (
                <div key={index} className={`p-4 border rounded-lg ${getRowClassName(item.daysUntilOverdue, item.riskLevel)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{item.trainId}</span>
                    <Badge variant={getRiskBadgeColor(item.riskLevel)} className="text-xs">
                      {item.riskLevel}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {item.maintenanceType}
                  </div>
                  <div className="text-sm">
                    <strong>{item.predictedOverdueDate.toLocaleDateString()}</strong>
                  </div>
                  <div className={`text-xs mt-1 ${
                    item.daysUntilOverdue <= 0 ? 'text-red-600 font-medium' :
                    item.daysUntilOverdue <= 7 ? 'text-yellow-600' : 'text-muted-foreground'
                  }`}>
                    {item.daysUntilOverdue <= 0 
                      ? `${Math.abs(item.daysUntilOverdue)} days overdue`
                      : `${item.daysUntilOverdue} days remaining`
                    }
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
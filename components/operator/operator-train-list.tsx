'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Train,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  Upload,
  Eye,
  Wrench
} from 'lucide-react'

interface TrainData {
  trainsetId: number
  trainId: string
  daysUntilOverdue: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  confidence: number
  maintenanceType: string
  lastMaintenance: string
  nextDue: string
  status: 'completed' | 'pending' | 'urgent' | 'overdue'
}

export default function OperatorTrainList() {
  const [trains, setTrains] = useState<TrainData[]>([])
  const [filteredTrains, setFilteredTrains] = useState<TrainData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'my-trains' | 'urgent' | 'overdue'>('all')

  const fetchTrainData = async () => {
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
        const trainData = result.data.predictions.map((p: any) => {
          let status: 'completed' | 'pending' | 'urgent' | 'overdue'
          if (p.daysUntilOverdue <= 0) status = 'overdue'
          else if (p.daysUntilOverdue <= 7) status = 'urgent'
          else if (p.daysUntilOverdue <= 30) status = 'pending'
          else status = 'completed'

          return {
            trainsetId: p.trainsetId,
            trainId: p.trainId,
            daysUntilOverdue: p.daysUntilOverdue,
            riskLevel: p.riskLevel,
            confidence: p.confidence,
            maintenanceType: extractMaintenanceType(p.recommendation),
            lastMaintenance: generateLastMaintenanceDate(p.daysUntilOverdue),
            nextDue: new Date(p.predictedOverdueDate).toLocaleDateString(),
            status
          }
        })
        
        setTrains(trainData)
        setFilteredTrains(trainData)
      }
    } catch (error) {
      console.error('Failed to fetch train data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load train data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrainData()
  }, [])

  useEffect(() => {
    let filtered = trains

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(train => 
        train.trainId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        train.maintenanceType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    switch (selectedFilter) {
      case 'my-trains':
        // In real app, this would filter by assigned operator
        filtered = filtered.slice(0, Math.ceil(filtered.length / 2))
        break
      case 'urgent':
        filtered = filtered.filter(train => train.status === 'urgent')
        break
      case 'overdue':
        filtered = filtered.filter(train => train.status === 'overdue')
        break
      default:
        break
    }

    setFilteredTrains(filtered)
  }, [trains, searchTerm, selectedFilter])

  const extractMaintenanceType = (recommendation: string): string => {
    const types = ['Brake', 'Engine', 'Electrical', 'Coach', 'Routine', 'HVAC']
    for (const type of types) {
      if (recommendation.toLowerCase().includes(type.toLowerCase())) {
        return type
      }
    }
    return 'General'
  }

  const generateLastMaintenanceDate = (daysUntilOverdue: number): string => {
    // Generate mock last maintenance date based on days until overdue
    const lastDate = new Date()
    lastDate.setDate(lastDate.getDate() - (90 - daysUntilOverdue))
    return lastDate.toLocaleDateString()
  }

  const getStatusBadge = (status: string, daysUntilOverdue: number) => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>
      case 'urgent':
        return <Badge variant="secondary">Urgent</Badge>
      case 'pending':
        return <Badge variant="default">Due Soon</Badge>
      case 'completed':
        return <Badge variant="outline">On Schedule</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'urgent':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'pending':
        return <Wrench className="h-4 w-4 text-blue-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Train className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusCount = (status: string) => {
    return trains.filter(train => train.status === status).length
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Train className="h-5 w-5" />
            My Train List
          </CardTitle>
          <CardDescription>Loading your assigned trains...</CardDescription>
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
            Error Loading Trains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchTrainData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Train Management</h2>
          <p className="text-muted-foreground">
            View and manage your assigned trains
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Data
          </Button>
          <Button onClick={fetchTrainData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
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
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{getStatusCount('overdue')}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold text-yellow-600">{getStatusCount('urgent')}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Schedule</p>
                <p className="text-2xl font-bold text-green-600">{getStatusCount('completed')}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trains or maintenance type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                All Trains
              </Button>
              <Button
                variant={selectedFilter === 'my-trains' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('my-trains')}
              >
                My Trains
              </Button>
              <Button
                variant={selectedFilter === 'urgent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('urgent')}
              >
                Urgent
              </Button>
              <Button
                variant={selectedFilter === 'overdue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('overdue')}
              >
                Overdue
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTrains.length === 0 ? (
            <div className="text-center py-8">
              <Train className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No trains found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTrains.map((train, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(train.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-lg">{train.trainId}</span>
                        {getStatusBadge(train.status, train.daysUntilOverdue)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {train.maintenanceType} • Last: {train.lastMaintenance}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium mb-1">
                      Due: {train.nextDue}
                    </div>
                    <div className={`text-xs ${
                      train.daysUntilOverdue <= 0 ? 'text-red-600 font-medium' :
                      train.daysUntilOverdue <= 7 ? 'text-yellow-600' : 'text-muted-foreground'
                    }`}>
                      {train.daysUntilOverdue <= 0 
                        ? `${Math.abs(train.daysUntilOverdue)} days overdue`
                        : `${train.daysUntilOverdue} days remaining`
                      }
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Confidence: {train.confidence}%
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant={train.status === 'overdue' || train.status === 'urgent' ? 'default' : 'outline'}
                    >
                      <Wrench className="h-4 w-4 mr-1" />
                      {train.status === 'overdue' || train.status === 'urgent' ? 'Urgent' : 'Schedule'}
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
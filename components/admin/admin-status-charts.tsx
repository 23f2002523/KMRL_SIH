'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'

interface StatusSummary {
  completed: number
  pending: number
  urgent: number
  overdue: number
  total: number
}

interface ChartData {
  name: string
  value: number
  color: string
  percentage: number
  [key: string]: any
}

interface TrendData {
  month: string
  completed: number
  pending: number
  overdue: number
}

export default function AdminStatusCharts() {
  const [statusData, setStatusData] = useState<StatusSummary>({
    completed: 0, pending: 0, urgent: 0, overdue: 0, total: 0
  })
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatusData = async () => {
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
        const predictions = result.data.predictions
        
        // Calculate status summary
        const summary = {
          total: predictions.length,
          completed: predictions.filter((p: any) => p.daysUntilOverdue > 30).length,
          pending: predictions.filter((p: any) => p.daysUntilOverdue > 0 && p.daysUntilOverdue <= 30).length,
          urgent: predictions.filter((p: any) => p.daysUntilOverdue <= 7 && p.daysUntilOverdue > 0).length,
          overdue: predictions.filter((p: any) => p.daysUntilOverdue <= 0).length
        }
        setStatusData(summary)

        // Generate mock trend data (in real app, this would come from historical data)
        const trends: TrendData[] = [
          { month: 'Jan', completed: 45, pending: 12, overdue: 3 },
          { month: 'Feb', completed: 52, pending: 8, overdue: 2 },
          { month: 'Mar', completed: 48, pending: 15, overdue: 5 },
          { month: 'Apr', completed: 61, pending: 10, overdue: 1 },
          { month: 'May', completed: summary.completed, pending: summary.pending, overdue: summary.overdue },
        ]
        setTrendData(trends)
      }
    } catch (error) {
      console.error('Failed to fetch status data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load status data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatusData()
  }, [])

  const pieChartData: ChartData[] = [
    {
      name: 'On Schedule',
      value: statusData.completed,
      color: '#10b981',
      percentage: statusData.total > 0 ? Math.round((statusData.completed / statusData.total) * 100) : 0
    },
    {
      name: 'Pending',
      value: statusData.pending,
      color: '#3b82f6',
      percentage: statusData.total > 0 ? Math.round((statusData.pending / statusData.total) * 100) : 0
    },
    {
      name: 'Urgent',
      value: statusData.urgent,
      color: '#f59e0b',
      percentage: statusData.total > 0 ? Math.round((statusData.urgent / statusData.total) * 100) : 0
    },
    {
      name: 'Overdue',
      value: statusData.overdue,
      color: '#ef4444',
      percentage: statusData.total > 0 ? Math.round((statusData.overdue / statusData.total) * 100) : 0
    }
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} trains ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium">{entry.value}</span>
            <span className="text-xs text-muted-foreground">
              ({pieChartData.find(d => d.name === entry.value)?.percentage}%)
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status Summary</CardTitle>
            <CardDescription>Loading status data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Loading trend data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Error Loading Charts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchStatusData} variant="outline" size="sm">
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
          <h2 className="text-2xl font-bold tracking-tight">Maintenance Analytics</h2>
          <p className="text-muted-foreground">
            Visual insights into train maintenance status and trends
          </p>
        </div>
        <Button onClick={fetchStatusData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Trains</p>
                <p className="text-3xl font-bold">{statusData.total}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                <p className="text-3xl font-bold text-green-600">
                  {statusData.total > 0 ? Math.round(((statusData.completed + statusData.pending) / statusData.total) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                <p className="text-3xl font-bold text-red-600">{statusData.overdue}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold text-blue-600">
                  {statusData.total > 0 ? Math.round((statusData.completed / statusData.total) * 100) : 0}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Status Distribution</CardTitle>
            <CardDescription>
              Current status breakdown of all trains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="40%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Status Badges */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm font-medium">On Schedule</span>
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  {statusData.completed}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm font-medium">Pending</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                  {statusData.pending}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm font-medium">Urgent</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                  {statusData.urgent}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="text-sm font-medium">Overdue</span>
                <Badge variant="outline" className="bg-red-100 text-red-700">
                  {statusData.overdue}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart - Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Maintenance Trends</CardTitle>
            <CardDescription>
              Historical maintenance completion trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="pending" fill="#3b82f6" name="Pending" />
                  <Bar dataKey="overdue" fill="#ef4444" name="Overdue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Trend Insights */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Key Insights</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Current completion rate: {statusData.total > 0 ? Math.round((statusData.completed / statusData.total) * 100) : 0}%</li>
                <li>• {statusData.overdue > 0 ? `${statusData.overdue} trains need immediate attention` : 'No overdue maintenance tasks'}</li>
                <li>• {statusData.urgent > 0 ? `${statusData.urgent} trains due within 7 days` : 'No urgent maintenance pending'}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
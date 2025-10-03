'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Wrench, 
  Target,
  DollarSign,
  Timer,
  Zap,
  Shield,
  Activity,
  RefreshCw
} from 'lucide-react'

interface MaintenancePrediction {
  trainsetId: number
  trainId: string
  predictedOverdueDate: Date
  daysUntilOverdue: number
  confidence: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommendation: string
  factors: string[]
}

interface FailurePattern {
  trainsetId: number
  trainId: string
  maintenanceType: string
  failureCount: number
  avgDaysBetweenFailures: number
  lastFailureDate: Date
  riskScore: number
  recommendation: string
}

interface SmartAlert {
  type: 'PREDICTION' | 'PATTERN' | 'OVERDUE' | 'CRITICAL'
  priority: number
  title: string
  message: string
  trainsetId: number
  actionRequired: string
  estimatedCost?: number
  estimatedDowntime?: number
}

interface AIData {
  maintenancePredictions: MaintenancePrediction[]
  failurePatterns: FailurePattern[]
  smartAlerts: SmartAlert[]
  summary: {
    totalPredictions: number
    criticalPredictions: number
    highRiskPredictions: number
    failurePatternsDetected: number
    highRiskPatterns: number
    totalAlerts: number
    criticalAlerts: number
    estimatedCosts: number
    estimatedDowntime: number
  }
}

export default function AIPredictionsDashboard() {
  const [aiData, setAIData] = useState<AIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAIData = async () => {
    try {
      setError(null)
      const response = await fetch('/api/ai/predictions', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setAIData(result.data)
    } catch (error) {
      console.error('Failed to fetch AI data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load AI predictions')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAIData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAIData()
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

  const getPriorityBadgeColor = (priority: number) => {
    if (priority === 1) return 'destructive'
    if (priority === 2) return 'secondary'
    if (priority === 3) return 'default'
    return 'outline'
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4" />
      case 'OVERDUE': return <Clock className="h-4 w-4" />
      case 'PATTERN': return <TrendingUp className="h-4 w-4" />
      case 'PREDICTION': return <Brain className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">AI Predictions</h2>
            <p className="text-muted-foreground">Loading AI-powered maintenance insights...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading AI Predictions</AlertTitle>
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" className="ml-2" onClick={handleRefresh}>
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!aiData) {
    return (
      <Alert>
        <Brain className="h-4 w-4" />
        <AlertTitle>No AI Data Available</AlertTitle>
        <AlertDescription>
          AI predictions are not available at the moment.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8" />
            AI Predictions & Insights
          </h2>
          <p className="text-muted-foreground">
            AI-powered maintenance forecasting and failure pattern analysis
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiData.summary.totalPredictions}</div>
            <p className="text-xs text-muted-foreground">
              {aiData.summary.criticalPredictions} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failure Patterns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiData.summary.failurePatternsDetected}</div>
            <p className="text-xs text-muted-foreground">
              {aiData.summary.highRiskPatterns} high risk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smart Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiData.summary.totalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {aiData.summary.criticalAlerts} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(aiData.summary.estimatedCosts / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">
              {aiData.summary.estimatedDowntime}h downtime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions">Maintenance Predictions</TabsTrigger>
          <TabsTrigger value="patterns">Failure Patterns</TabsTrigger>
          <TabsTrigger value="alerts">Smart Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Maintenance Predictions
              </CardTitle>
              <CardDescription>
                AI-predicted maintenance overdue dates and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {aiData.maintenancePredictions.map((prediction, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Train {prediction.trainId}</Badge>
                          <Badge variant={getRiskBadgeColor(prediction.riskLevel)}>
                            {prediction.riskLevel}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {prediction.daysUntilOverdue > 0 
                            ? `${prediction.daysUntilOverdue} days until overdue`
                            : `${Math.abs(prediction.daysUntilOverdue)} days overdue`
                          }
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Confidence</span>
                          <span>{prediction.confidence}%</span>
                        </div>
                        <Progress value={prediction.confidence} className="h-2" />
                      </div>

                      <p className="text-sm">{prediction.recommendation}</p>

                      {prediction.factors.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Key Factors:</p>
                          <div className="flex flex-wrap gap-1">
                            {prediction.factors.slice(0, 3).map((factor, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Failure Pattern Analysis
              </CardTitle>
              <CardDescription>
                Detected recurring maintenance patterns and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {aiData.failurePatterns.map((pattern, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Train {pattern.trainId}</Badge>
                          <Badge variant="secondary">{pattern.maintenanceType}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <span className="text-sm font-medium">{pattern.riskScore}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Failure Count:</span>
                          <span className="ml-2 font-medium">{pattern.failureCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Interval:</span>
                          <span className="ml-2 font-medium">{pattern.avgDaysBetweenFailures} days</span>
                        </div>
                      </div>

                      <p className="text-sm">{pattern.recommendation}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Smart Alerts
              </CardTitle>
              <CardDescription>
                AI-generated alerts requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {aiData.smartAlerts.map((alert, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getAlertIcon(alert.type)}
                          <span className="font-medium">{alert.title}</span>
                          <Badge variant={getPriorityBadgeColor(alert.priority)}>
                            Priority {alert.priority}
                          </Badge>
                        </div>
                        <Badge variant="outline">Train {alert.trainsetId}</Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">{alert.message}</p>

                      <div className="bg-muted/50 rounded p-3 space-y-2">
                        <p className="text-sm font-medium">Action Required:</p>
                        <p className="text-sm">{alert.actionRequired}</p>
                      </div>

                      {(alert.estimatedCost || alert.estimatedDowntime) && (
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          {alert.estimatedCost && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ₹{alert.estimatedCost.toLocaleString()}
                            </div>
                          )}
                          {alert.estimatedDowntime && (
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              {alert.estimatedDowntime}h downtime
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
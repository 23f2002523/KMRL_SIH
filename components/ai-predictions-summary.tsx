'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  RefreshCw,
  ArrowRight
} from 'lucide-react'

interface AISummaryProps {
  showFullButton?: boolean
  onShowFull?: () => void
}

interface AIQuickSummary {
  maintenancePredictions: number
  criticalPredictions: number
  failurePatterns: number
  smartAlerts: number
  criticalAlerts: number
  estimatedCosts: number
  estimatedDowntime: number
  lastUpdated: string
}

export default function AIPredictionsSummary({ showFullButton = true, onShowFull }: AISummaryProps) {
  const [summaryData, setSummaryData] = useState<AIQuickSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = async () => {
    try {
      setError(null)
      const response = await fetch('/api/ai/predictions?type=summary', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.data && result.data.summary) {
        setSummaryData({
          maintenancePredictions: result.data.summary.totalPredictions || 0,
          criticalPredictions: result.data.summary.criticalPredictions || 0,
          failurePatterns: result.data.summary.failurePatternsDetected || 0,
          smartAlerts: result.data.summary.totalAlerts || 0,
          criticalAlerts: result.data.summary.criticalAlerts || 0,
          estimatedCosts: result.data.summary.estimatedCosts || 0,
          estimatedDowntime: result.data.summary.estimatedDowntime || 0,
          lastUpdated: new Date().toLocaleString()
        })
      }
    } catch (error) {
      console.error('Failed to fetch AI summary:', error)
      setError(error instanceof Error ? error.message : 'Failed to load AI summary')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <CardTitle>AI Predictions</CardTitle>
            </div>
            <RefreshCw className="h-4 w-4 animate-spin" />
          </div>
          <CardDescription>Loading AI insights...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-muted animate-pulse rounded w-24" />
                <div className="h-4 bg-muted animate-pulse rounded w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>AI Predictions</CardTitle>
          </div>
          <CardDescription className="text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={fetchSummary}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!summaryData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <CardTitle>AI Predictions</CardTitle>
          </div>
          <CardDescription>No AI data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <CardTitle>AI Predictions</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchSummary}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          AI-powered maintenance insights and forecasting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Maintenance Predictions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Maintenance Predictions</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{summaryData.maintenancePredictions}</Badge>
            {summaryData.criticalPredictions > 0 && (
              <Badge variant="destructive" className="text-xs">
                {summaryData.criticalPredictions} critical
              </Badge>
            )}
          </div>
        </div>

        {/* Failure Patterns */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Failure Patterns</span>
          </div>
          <Badge variant="secondary">{summaryData.failurePatterns}</Badge>
        </div>

        {/* Smart Alerts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Smart Alerts</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{summaryData.smartAlerts}</Badge>
            {summaryData.criticalAlerts > 0 && (
              <Badge variant="destructive" className="text-xs">
                {summaryData.criticalAlerts} urgent
              </Badge>
            )}
          </div>
        </div>

        {/* Cost Impact */}
        {summaryData.estimatedCosts > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Estimated Cost Impact</span>
            </div>
            <span className="text-sm font-medium">
              ₹{(summaryData.estimatedCosts / 1000).toFixed(0)}K
            </span>
          </div>
        )}

        {/* Downtime */}
        {summaryData.estimatedDowntime > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Estimated Downtime</span>
            </div>
            <span className="text-sm font-medium">{summaryData.estimatedDowntime}h</span>
          </div>
        )}

        {/* Last Updated */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Last updated: {summaryData.lastUpdated}
          </p>
        </div>

        {/* Show Full Button */}
        {showFullButton && onShowFull && (
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={onShowFull}
            >
              View Full AI Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
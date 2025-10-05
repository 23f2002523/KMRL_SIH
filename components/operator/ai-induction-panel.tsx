"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface InductionResult {
  'Train ID': string
  'Induction Score': number
  'Recommendation': string
  'Priority Level': string
  'Availability Score': number
  'Maintenance Score': number
  'Alert Count': number
  'Analysis Date': string
}

interface InductionData {
  totalTrains: number
  results: InductionResult[]
  lastGenerated: string
  algorithm: string
}

export function AIInductionPanel() {
  const [data, setData] = useState<InductionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const { toast } = useToast()

  const fetchInductionData = async () => {
    try {
      const response = await fetch('/api/ai/induction')
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch induction data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching induction data:', error)
      toast({
        title: "Error", 
        description: "Failed to connect to induction system",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const regenerateData = async () => {
    setRegenerating(true)
    try {
      const response = await fetch('/api/ai/induction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ forceRegenerate: true })
      })
      
      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Induction analysis regenerated successfully"
        })
        await fetchInductionData() // Refresh data
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to regenerate analysis",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error regenerating data:', error)
      toast({
        title: "Error",
        description: "Failed to regenerate analysis",
        variant: "destructive"
      })
    } finally {
      setRegenerating(false)
    }
  }

  useEffect(() => {
    fetchInductionData()
  }, [])

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-orange-100 text-orange-800'
      default: return 'bg-red-100 text-red-800'
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation.includes('PRIORITY')) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (recommendation.includes('RECOMMENDED')) return <CheckCircle className="w-4 h-4 text-blue-600" />
    if (recommendation.includes('CONDITIONAL')) return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    return <XCircle className="w-4 h-4 text-red-600" />
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading AI Induction Analysis...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Induction Analysis</CardTitle>
          <CardDescription>Failed to load induction data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchInductionData} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>🚀 KMRL AI Induction System</CardTitle>
              <CardDescription>
                Intelligent train induction recommendations powered by {data.algorithm}
              </CardDescription>
            </div>
            <Button 
              onClick={regenerateData} 
              disabled={regenerating}
              variant="outline"
              size="sm"
            >
              {regenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.totalTrains}</div>
              <div className="text-sm text-gray-600">Total Trains Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.results.filter(r => r['Priority Level'] === 'HIGH').length}
              </div>
              <div className="text-sm text-gray-600">Priority Inductions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {new Date(data.lastGenerated).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Last Analysis</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 10 Results */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 Top Induction Recommendations</CardTitle>
          <CardDescription>Highest scoring trains ready for induction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.results.slice(0, 10).map((result, index) => (
              <div key={result['Train ID']} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                  <div>
                    <div className="font-semibold">{result['Train ID']}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      {getRecommendationIcon(result.Recommendation)}
                      {result.Recommendation}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{result['Induction Score']}</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                  
                  <Badge className={getPriorityColor(result['Priority Level'])}>
                    {result['Priority Level']}
                  </Badge>
                  
                  <div className="text-right text-sm">
                    <div>Availability: {result['Availability Score']}%</div>
                    <div>Maintenance: {result['Maintenance Score']}%</div>
                    <div>Alerts: {result['Alert Count']}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full Results Table (if needed) */}
      {data.results.length > 10 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Complete Analysis Results</CardTitle>
            <CardDescription>All {data.totalTrains} trains ranked by induction readiness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Train ID</th>
                    <th className="text-center p-2">Score</th>
                    <th className="text-left p-2">Recommendation</th>
                    <th className="text-center p-2">Priority</th>
                    <th className="text-center p-2">Availability</th>
                    <th className="text-center p-2">Maintenance</th>
                    <th className="text-center p-2">Alerts</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((result) => (
                    <tr key={result['Train ID']} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{result['Train ID']}</td>
                      <td className="p-2 text-center font-bold text-blue-600">{result['Induction Score']}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {getRecommendationIcon(result.Recommendation)}
                          <span className="text-xs">{result.Recommendation}</span>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <Badge className={getPriorityColor(result['Priority Level'])}>
                          {result['Priority Level']}
                        </Badge>
                      </td>
                      <td className="p-2 text-center">{result['Availability Score']}%</td>
                      <td className="p-2 text-center">{result['Maintenance Score']}%</td>
                      <td className="p-2 text-center">{result['Alert Count']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
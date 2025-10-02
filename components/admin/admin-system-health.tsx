"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Activity, Server, Database, Wifi } from 'lucide-react'

export function AdminSystemHealth() {
  const systemMetrics = [
    {
      name: 'Database Performance',
      value: 94,
      status: 'Excellent',
      icon: Database,
      color: 'text-green-600',
    },
    {
      name: 'API Response Time',
      value: 87,
      status: 'Good',
      icon: Server,
      color: 'text-blue-600',
    },
    {
      name: 'Network Connectivity',
      value: 98,
      status: 'Excellent',
      icon: Wifi,
      color: 'text-green-600',
    },
    {
      name: 'System Load',
      value: 72,
      status: 'Normal',
      icon: Activity,
      color: 'text-yellow-600',
    },
  ]

  const getProgressColor = (value: number) => {
    if (value >= 90) return 'bg-green-500'
    if (value >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
          System Health Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {systemMetrics.map((metric) => (
            <div key={metric.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{metric.value}%</span>
                  <span className={`ml-2 text-xs ${metric.color}`}>{metric.status}</span>
                </div>
              </div>
              <Progress 
                value={metric.value} 
                className="h-2"
              />
            </div>
          ))}
        </div>

        {/* System Status Summary */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-900">Overall System Status</span>
          </div>
          <p className="text-sm text-green-700">
            All systems operational. Last maintenance: 2 hours ago.
            Next scheduled maintenance: Tomorrow 2:00 AM.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
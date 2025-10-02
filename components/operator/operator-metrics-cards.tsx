"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Train, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

export function OperatorMetricsCards() {
  const metrics = [
    {
      title: 'Assigned Trains',
      value: '8',
      subtitle: '6 Active, 2 Standby',
      icon: Train,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Alerts',
      value: '3',
      subtitle: '1 Critical, 2 Warning',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Operational Status',
      value: '100%',
      subtitle: 'All Systems Normal',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Shift Progress',
      value: '65%',
      subtitle: '5h 12m remaining',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <div className={`rounded-md p-2 ${metric.bgColor}`}>
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
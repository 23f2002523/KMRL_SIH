"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Train, Users, AlertTriangle, Activity, Database, Shield } from 'lucide-react'

export function AdminMetricsCards() {
  const metrics = [
    {
      title: 'Total Fleet Size',
      value: '25',
      subtitle: 'Active Trainsets',
      icon: Train,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'System Users',
      value: '42',
      subtitle: '15 Admin, 27 Operators',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Alerts',
      value: '8',
      subtitle: '3 Critical, 5 Warning',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'System Health',
      value: '98.5%',
      subtitle: 'Overall Performance',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Database Size',
      value: '1.2GB',
      subtitle: '25,000+ Records',
      icon: Database,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Security Score',
      value: '95%',
      subtitle: 'All Systems Secure',
      icon: Shield,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
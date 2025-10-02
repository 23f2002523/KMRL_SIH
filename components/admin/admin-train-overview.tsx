"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Train, Clock, Wrench, Shield } from 'lucide-react'

export function AdminTrainOverview() {
  const trainSummary = [
    { status: 'In Service', count: 18, color: 'bg-green-100 text-green-800' },
    { status: 'Standby', count: 4, color: 'bg-yellow-100 text-yellow-800' },
    { status: 'Maintenance', count: 3, color: 'bg-red-100 text-red-800' },
  ]

  const criticalTrains = [
    {
      id: 'TS003',
      issue: 'Expired Telecom Certificate',
      priority: 'Critical',
      timeLeft: '2 days overdue',
      icon: Shield,
    },
    {
      id: 'TS012',
      issue: 'Brake System Alert',
      priority: 'High',
      timeLeft: '6 hours',
      icon: Wrench,
    },
    {
      id: 'TS007',
      issue: 'Scheduled Maintenance Due',
      priority: 'Medium',
      timeLeft: '1 day',
      icon: Clock,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Train className="h-5 w-5 text-blue-600" />
          Fleet Overview & Critical Issues
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Train Status Summary */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Fleet Status Summary</h4>
          <div className="grid grid-cols-3 gap-4">
            {trainSummary.map((item) => (
              <div key={item.status} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                <Badge className={item.color} variant="secondary">
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Issues */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Critical Issues Requiring Admin Attention</h4>
          <div className="space-y-3">
            {criticalTrains.map((train) => (
              <div key={train.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-md">
                    <train.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{train.id}</div>
                    <div className="text-sm text-gray-600">{train.issue}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={train.priority === 'Critical' ? 'destructive' : 
                            train.priority === 'High' ? 'default' : 'secondary'}
                  >
                    {train.priority}
                  </Badge>
                  <div className="text-xs text-gray-500 mt-1">{train.timeLeft}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
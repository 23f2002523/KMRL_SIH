"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react'

export function OperatorAlerts() {
  const activeAlerts = [
    {
      id: 1,
      type: 'Critical',
      title: 'Brake System Alert',
      trainId: 'TS012',
      message: 'Brake pressure below threshold',
      timestamp: '2 min ago',
      action: 'Immediate Stop Required',
      acknowledged: false,
    },
    {
      id: 2,
      type: 'Warning',
      title: 'Door Sensor Issue',
      trainId: 'TS001',
      message: 'Door sensor malfunction car 2',
      timestamp: '15 min ago',
      action: 'Schedule Maintenance',
      acknowledged: false,
    },
    {
      id: 3,
      type: 'Info',
      title: 'Schedule Update',
      trainId: 'TS005',
      message: 'Next service due in 500km',
      timestamp: '1 hour ago',
      action: 'Plan Maintenance',
      acknowledged: true,
    },
    {
      id: 4,
      type: 'Warning',
      title: 'Battery Level Low',
      trainId: 'TS008',
      message: 'Battery at 75%, charge recommended',
      timestamp: '2 hours ago',
      action: 'Return to Depot',
      acknowledged: false,
    },
  ]

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'Critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'Warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'Info':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'Critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      case 'Warning':
        return <Badge className="bg-orange-100 text-orange-800">Warning</Badge>
      case 'Info':
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Active Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeAlerts.map((alert) => (
            <div key={alert.id} className={`border rounded-lg p-3 ${alert.acknowledged ? 'bg-gray-50 border-gray-200' : 'bg-white border-orange-200'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getAlertIcon(alert.type)}
                  <div>
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600">Train {alert.trainId}</p>
                  </div>
                </div>
                {getAlertBadge(alert.type)}
              </div>

              <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">{alert.timestamp}</div>
                {!alert.acknowledged ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      Acknowledge
                    </Button>
                    <Button size="sm" className="text-xs">
                      {alert.action}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Acknowledged
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              Emergency Stop All Trains
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              Request Maintenance Support
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              Contact Control Center
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
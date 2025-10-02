"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Train, MapPin, Clock, Fuel } from 'lucide-react'

export function OperatorTrainMonitor() {
  const assignedTrains = [
    {
      id: 'TS001',
      status: 'Active',
      location: 'Aluva - Kalamassery',
      speed: '65 km/h',
      passengers: '142/180',
      nextStop: 'Kalamassery',
      eta: '3 min',
      batteryLevel: 87,
      alerts: 0,
    },
    {
      id: 'TS005',
      status: 'Active',
      location: 'Palarivattom - Edapally',
      speed: '58 km/h',
      passengers: '98/180',
      nextStop: 'Edapally',
      eta: '5 min',
      batteryLevel: 92,
      alerts: 0,
    },
    {
      id: 'TS012',
      status: 'Warning',
      location: 'MG Road Station',
      speed: '0 km/h',
      passengers: '156/180',
      nextStop: 'Stationary',
      eta: 'Delayed',
      batteryLevel: 78,
      alerts: 1,
    },
    {
      id: 'TS008',
      status: 'Standby',
      location: 'Depot - Bay 3',
      speed: '0 km/h',
      passengers: '0/180',
      nextStop: 'Ready for Service',
      eta: 'On Call',
      batteryLevel: 95,
      alerts: 0,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'Warning':
        return <Badge className="bg-orange-100 text-orange-800">Warning</Badge>
      case 'Standby':
        return <Badge className="bg-blue-100 text-blue-800">Standby</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getBatteryColor = (level: number) => {
    if (level >= 80) return 'text-green-600'
    if (level >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Train className="h-5 w-5 text-green-600" />
          My Assigned Trains - Real-time Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignedTrains.map((train) => (
            <div key={train.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-md">
                    <Train className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{train.id}</h3>
                    {getStatusBadge(train.status)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {train.alerts > 0 && (
                    <Badge variant="destructive">{train.alerts} Alert{train.alerts > 1 ? 's' : ''}</Badge>
                  )}
                  <Button size="sm" variant="outline">
                    Control
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-700">Location</div>
                    <div className="text-gray-600">{train.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-700">Next Stop</div>
                    <div className="text-gray-600">{train.nextStop} ({train.eta})</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Train className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-700">Speed</div>
                    <div className="text-gray-600">{train.speed}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-700">Battery</div>
                    <div className={getBatteryColor(train.batteryLevel)}>{train.batteryLevel}%</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Passengers: {train.passengers}</span>
                  <span className="text-gray-600">Capacity: {Math.round((parseInt(train.passengers.split('/')[0]) / parseInt(train.passengers.split('/')[1])) * 100)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
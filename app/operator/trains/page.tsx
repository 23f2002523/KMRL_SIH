"use client"

import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Train, Play, Square, AlertTriangle, CheckCircle, Clock, Navigation } from 'lucide-react'

interface TrainInfo {
  trainId: string
  line: string
  currentStation: string
  nextStation: string
  status: 'running' | 'stopped' | 'maintenance' | 'delayed'
  passengers: number
  capacity: number
  speed: number
}

export default function OperatorTrainsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null)
  const [trains] = useState<TrainInfo[]>([
    {
      trainId: 'KMRL-001',
      line: 'Line 1 (Aluva - Palarivattom)',
      currentStation: 'Kaloor',
      nextStation: 'Lissie',
      status: 'running',
      passengers: 245,
      capacity: 300,
      speed: 65
    },
    {
      trainId: 'KMRL-002',
      line: 'Line 1 (Palarivattom - Aluva)',
      currentStation: 'Edapally',
      nextStation: 'Changampuzha Park',
      status: 'running',
      passengers: 180,
      capacity: 300,
      speed: 58
    },
    {
      trainId: 'KMRL-003',
      line: 'Line 1 (Aluva - Palarivattom)',
      currentStation: 'Aluva Depot',
      nextStation: 'Aluva',
      status: 'maintenance',
      passengers: 0,
      capacity: 300,
      speed: 0
    }
  ])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (user?.role !== 'Operator' && user?.role !== 'Admin') {
      router.push('/')
      return
    }
  }, [isAuthenticated, user, router])

  if (!user || (user.role !== 'Operator' && user.role !== 'Admin')) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500'
      case 'stopped': return 'bg-yellow-500'
      case 'maintenance': return 'bg-red-500'
      case 'delayed': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="h-4 w-4" />
      case 'stopped': return <Square className="h-4 w-4" />
      case 'maintenance': return <AlertTriangle className="h-4 w-4" />
      case 'delayed': return <Clock className="h-4 w-4" />
      default: return <Train className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Train Operations</h1>
          <p className="text-gray-600 mt-1">Monitor and control KMRL train operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Navigation className="h-4 w-4 mr-2" />
            Route Map
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700" size="sm">
            Emergency Stop All
          </Button>
        </div>
      </div>

      {/* Train Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Trains</p>
                <p className="text-2xl font-bold text-green-600">2</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Maintenance</p>
                <p className="text-2xl font-bold text-red-600">1</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Passengers</p>
                <p className="text-2xl font-bold text-blue-600">425</p>
              </div>
              <Train className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Status</p>
                <p className="text-2xl font-bold text-green-600">Normal</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Train Details */}
      <Tabs defaultValue="live" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">Live Operations</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Train Operations Control</CardTitle>
              <CardDescription>
                Real-time train monitoring and control interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Train ID</TableHead>
                    <TableHead>Line</TableHead>
                    <TableHead>Current Station</TableHead>
                    <TableHead>Next Station</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Passengers</TableHead>
                    <TableHead>Speed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trains.map((train) => (
                    <TableRow 
                      key={train.trainId}
                      className={selectedTrain === train.trainId ? 'bg-blue-50' : ''}
                    >
                      <TableCell className="font-medium">{train.trainId}</TableCell>
                      <TableCell className="text-sm">{train.line}</TableCell>
                      <TableCell>{train.currentStation}</TableCell>
                      <TableCell>{train.nextStation}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(train.status)} text-white`}
                        >
                          <span className="flex items-center gap-1">
                            {getStatusIcon(train.status)}
                            {train.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{train.passengers}/{train.capacity}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(train.passengers / train.capacity) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{train.speed} km/h</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {train.status === 'running' ? (
                            <Button size="sm" variant="outline" className="text-red-600">
                              <Square className="h-3 w-3 mr-1" />
                              Stop
                            </Button>
                          ) : train.status === 'stopped' ? (
                            <Button size="sm" variant="outline" className="text-green-600">
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                          ) : null}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedTrain(train.trainId)}
                          >
                            Monitor
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Train Schedule</CardTitle>
              <CardDescription>
                View and manage train schedules and timetables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Train className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Schedule management interface coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Operations</CardTitle>
              <CardDescription>
                View maintenance status and schedule maintenance activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div className="flex-1">
                      <h3 className="font-medium text-red-800">KMRL-003 - Scheduled Maintenance</h3>
                      <p className="text-sm text-red-600">Brake system inspection and wheel maintenance</p>
                      <p className="text-xs text-red-500 mt-1">Started: 2 hours ago | ETA: 4 hours</p>
                    </div>
                    <Badge variant="destructive">In Progress</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Operator-only Features Note */}
      {user.role === 'Operator' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Train className="h-5 w-5" />
              Operator Access Level
            </CardTitle>
            <CardDescription className="text-blue-600">
              You have operational control over train systems and scheduling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-medium text-gray-900">Train Control</h3>
                <p className="text-sm text-gray-600 mt-1">Start, stop, and monitor train operations</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-medium text-gray-900">Service Status</h3>
                <p className="text-sm text-gray-600 mt-1">View real-time service information</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
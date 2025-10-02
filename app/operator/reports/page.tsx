"use client"

import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  Clock,
  Users,
  Train,
  Activity
} from 'lucide-react'

interface OperationalReport {
  id: string
  title: string
  type: 'daily' | 'weekly' | 'incident' | 'maintenance'
  date: string
  status: 'completed' | 'pending' | 'draft'
  priority: 'high' | 'medium' | 'low'
}

interface IncidentReport {
  id: string
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  reportedAt: string
  trainId: string
  station: string
  status: 'open' | 'investigating' | 'resolved'
}

export default function OperatorReportsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  
  const [operationalReports] = useState<OperationalReport[]>([
    {
      id: 'RPT-001',
      title: 'Daily Operations Report - Line 1',
      type: 'daily',
      date: '2024-01-15',
      status: 'completed',
      priority: 'medium'
    },
    {
      id: 'RPT-002',
      title: 'Weekly Performance Summary',
      type: 'weekly',
      date: '2024-01-14',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 'RPT-003',
      title: 'Maintenance Activity Report',
      type: 'maintenance',
      date: '2024-01-13',
      status: 'completed',
      priority: 'medium'
    }
  ])

  const [incidentReports] = useState<IncidentReport[]>([
    {
      id: 'INC-001',
      title: 'Signal Delay at Kaloor Station',
      severity: 'medium',
      reportedAt: '2024-01-15 14:30',
      trainId: 'KMRL-001',
      station: 'Kaloor',
      status: 'resolved'
    },
    {
      id: 'INC-002',
      title: 'Door Malfunction - Train KMRL-002',
      severity: 'high',
      reportedAt: '2024-01-15 09:15',
      trainId: 'KMRL-002',
      station: 'Edapally',
      status: 'investigating'
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
      case 'completed': case 'resolved': return 'bg-green-500'
      case 'pending': case 'investigating': return 'bg-yellow-500'
      case 'draft': case 'open': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600'
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operational Reports</h1>
          <p className="text-gray-600 mt-1">View and manage operational reports and incidents</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-teal-600 hover:bg-teal-700">
            <FileText className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Daily Reports</p>
                <p className="text-2xl font-bold text-blue-600">3</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Incidents</p>
                <p className="text-2xl font-bold text-red-600">1</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On-Time Performance</p>
                <p className="text-2xl font-bold text-green-600">96%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-blue-600">4.2m</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="operational" className="space-y-4">
        <TabsList>
          <TabsTrigger value="operational">Operational Reports</TabsTrigger>
          <TabsTrigger value="incidents">Incident Reports</TabsTrigger>
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="operational" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operational Reports</CardTitle>
              <CardDescription>
                Daily, weekly, and maintenance reports for train operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operationalReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.id}</TableCell>
                      <TableCell>{report.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {report.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(report.status)} text-white capitalize`}
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={report.priority === 'high' ? 'destructive' : 'outline'}
                          className="capitalize"
                        >
                          {report.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
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

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Reports</CardTitle>
              <CardDescription>
                Track and manage operational incidents and their resolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Train/Station</TableHead>
                    <TableHead>Reported At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidentReports.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium">{incident.id}</TableCell>
                      <TableCell>{incident.title}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`${getSeverityColor(incident.severity)} text-white capitalize`}
                        >
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{incident.trainId}</div>
                          <div className="text-gray-500">{incident.station}</div>
                        </div>
                      </TableCell>
                      <TableCell>{incident.reportedAt}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(incident.status)} text-white capitalize`}
                        >
                          {incident.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            Update
                          </Button>
                          <Button size="sm" variant="outline">
                            Details
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

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Service Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">On-Time Performance</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }} />
                      </div>
                      <span className="text-sm font-medium">96%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Service Reliability</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }} />
                      </div>
                      <span className="text-sm font-medium">94%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customer Satisfaction</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-teal-600 h-2 rounded-full" style={{ width: '92%' }} />
                      </div>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Passenger Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Peak Hour Capacity</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Daily Passengers</span>
                    <span className="font-medium">12,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Journey Time</span>
                    <span className="font-medium">18.5 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Station Dwell Time</span>
                    <span className="font-medium">45 sec</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Operator Access Note */}
      {user.role === 'Operator' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Operator Reporting Access
            </CardTitle>
            <CardDescription className="text-blue-600">
              You can create and view operational reports within your area of responsibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-medium text-gray-900">Incident Reporting</h3>
                <p className="text-sm text-gray-600 mt-1">Report and track operational incidents</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-medium text-gray-900">Performance Data</h3>
                <p className="text-sm text-gray-600 mt-1">Access operational performance metrics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
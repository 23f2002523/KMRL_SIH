"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { RoleGuard } from '@/hooks/use-role-access'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Clock,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  Plus,
  Edit,
  Eye,
} from 'lucide-react'
import { format, parseISO, differenceInHours } from 'date-fns'

interface Shift {
  id: string
  operatorId: string
  operatorName: string
  startTime: string
  endTime: string
  status: 'Scheduled' | 'Active' | 'Completed' | 'Missed'
  position: string
  location: string
  trainsAssigned: string[]
  notes?: string
}

interface ShiftHandover {
  id: string
  fromOperator: string
  toOperator: string
  shiftDate: string
  handoverTime: string
  status: 'Pending' | 'Completed' | 'Issues'
  trainsStatus: string
  maintenanceNotes: string
  issuesReported: string[]
  nextShiftPriorities: string[]
}

interface ShiftReport {
  id: string
  operatorId: string
  operatorName: string
  shiftDate: string
  startTime: string
  endTime: string
  trainsOperated: string[]
  incidentsReported: number
  maintenanceIssues: string[]
  performanceNotes: string
  status: 'Draft' | 'Submitted' | 'Approved'
}

export default function OperatorShiftsPage() {
  const { user } = useAuth()
  const [currentShifts, setCurrentShifts] = useState<Shift[]>([])
  const [shiftHandovers, setShiftHandovers] = useState<ShiftHandover[]>([])
  const [shiftReports, setShiftReports] = useState<ShiftReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState('current')

  // Form states
  const [handoverNotes, setHandoverNotes] = useState('')
  const [reportNotes, setReportNotes] = useState('')

  useEffect(() => {
    fetchShiftData()
  }, [])

  const fetchShiftData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/operator/shifts', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setCurrentShifts(data.currentShifts || [])
      setShiftHandovers(data.shiftHandovers || [])
      setShiftReports(data.shiftReports || [])
    } catch (error) {
      console.error('Error fetching shift data:', error)
      setError('Failed to load shift data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      'Scheduled': { variant: 'outline', icon: Clock },
      'Active': { variant: 'default', icon: CheckCircle },
      'Completed': { variant: 'default', icon: CheckCircle },
      'Missed': { variant: 'destructive', icon: AlertTriangle },
      'Pending': { variant: 'secondary', icon: Clock },
      'Issues': { variant: 'destructive', icon: AlertTriangle },
      'Draft': { variant: 'outline', icon: FileText },
      'Submitted': { variant: 'secondary', icon: FileText },
      'Approved': { variant: 'default', icon: CheckCircle },
    }

    const config = variants[status] || variants['Scheduled']
    const IconComponent = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getCurrentShift = () => {
    return currentShifts.find(shift => shift.status === 'Active' && shift.operatorId === user?.email)
  }

  const submitHandover = async () => {
    // Implementation for handover submission
    console.log('Submitting handover with notes:', handoverNotes)
    // Add API call here
  }

  const submitShiftReport = async () => {
    // Implementation for shift report submission
    console.log('Submitting shift report with notes:', reportNotes)
    // Add API call here
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Shift Data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Shifts</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchShiftData}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeShift = getCurrentShift()

  return (
    <RoleGuard role="Operator">
      <div className="min-h-screen bg-gray-50">
        <div className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                Shift Management
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your shifts, handovers, and operational reports for {user?.name}
              </p>
            </div>

            {/* Current Shift Status */}
            {activeShift && (
              <Card className="mb-6 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    Active Shift
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Position</p>
                      <p className="text-green-800">{activeShift.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Location</p>
                      <p className="text-green-800">{activeShift.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Shift Time</p>
                      <p className="text-green-800">
                        {format(parseISO(activeShift.startTime), 'HH:mm')} - 
                        {format(parseISO(activeShift.endTime), 'HH:mm')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Trains Assigned</p>
                      <p className="text-green-800">{activeShift.trainsAssigned.join(', ')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Content */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="current" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Current Shifts
                </TabsTrigger>
                <TabsTrigger value="handovers" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Handovers
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Shift Reports
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </TabsTrigger>
              </TabsList>

              {/* Current Shifts Tab */}
              <TabsContent value="current" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Today's Shifts
                    </CardTitle>
                    <CardDescription>
                      Overview of all operator shifts for today
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Operator</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Shift Time</TableHead>
                            <TableHead>Trains Assigned</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentShifts.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                No shifts scheduled for today
                              </TableCell>
                            </TableRow>
                          ) : (
                            currentShifts.map((shift) => (
                              <TableRow key={shift.id}>
                                <TableCell className="font-medium">{shift.operatorName}</TableCell>
                                <TableCell>{shift.position}</TableCell>
                                <TableCell>{shift.location}</TableCell>
                                <TableCell>
                                  {format(parseISO(shift.startTime), 'HH:mm')} - 
                                  {format(parseISO(shift.endTime), 'HH:mm')}
                                </TableCell>
                                <TableCell>{shift.trainsAssigned.join(', ')}</TableCell>
                                <TableCell>{getStatusBadge(shift.status)}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Handovers Tab */}
              <TabsContent value="handovers" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Create Handover */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Create Shift Handover
                      </CardTitle>
                      <CardDescription>
                        Complete your shift handover for the next operator
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Train Status Update</label>
                        <Textarea
                          placeholder="Current status of all assigned trains..."
                          value={handoverNotes}
                          onChange={(e) => setHandoverNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Issues & Notes</label>
                        <Textarea
                          placeholder="Any issues, maintenance needs, or important notes..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Next Shift Priorities</label>
                        <Textarea
                          placeholder="Priority tasks for the incoming operator..."
                          rows={2}
                        />
                      </div>
                      <Button onClick={submitHandover} className="w-full">
                        Submit Handover
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Recent Handovers */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Recent Handovers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {shiftHandovers.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">No recent handovers</p>
                        ) : (
                          shiftHandovers.slice(0, 5).map((handover) => (
                            <div key={handover.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">
                                  {handover.fromOperator} → {handover.toOperator}
                                </span>
                                {getStatusBadge(handover.status)}
                              </div>
                              <p className="text-sm text-gray-600">
                                {format(parseISO(handover.handoverTime), 'MMM dd, yyyy HH:mm')}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {handover.maintenanceNotes}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Create Report */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Submit Shift Report
                      </CardTitle>
                      <CardDescription>
                        Complete your end-of-shift report
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Trains Operated</label>
                        <Input placeholder="T101, T102, T103..." />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Incidents Reported</label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Maintenance Issues</label>
                        <Textarea
                          placeholder="Any maintenance issues encountered during shift..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Performance Notes</label>
                        <Textarea
                          placeholder="Overall shift performance and observations..."
                          value={reportNotes}
                          onChange={(e) => setReportNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <Button onClick={submitShiftReport} className="w-full">
                        Submit Report
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Recent Reports */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        My Shift Reports
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {shiftReports.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">No shift reports yet</p>
                        ) : (
                          shiftReports.slice(0, 5).map((report) => (
                            <div key={report.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">
                                  {format(parseISO(report.shiftDate), 'MMM dd, yyyy')}
                                </span>
                                {getStatusBadge(report.status)}
                              </div>
                              <p className="text-sm text-gray-600">
                                Trains: {report.trainsOperated.join(', ')}
                              </p>
                              <p className="text-sm text-gray-600">
                                Incidents: {report.incidentsReported}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {report.performanceNotes}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Upcoming Shifts
                    </CardTitle>
                    <CardDescription>
                      Your scheduled shifts for the next 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Shift Time</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Trains Assigned</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentShifts.filter(shift => shift.operatorId === user?.email).map((shift) => (
                            <TableRow key={shift.id}>
                              <TableCell>{format(parseISO(shift.startTime), 'MMM dd, yyyy')}</TableCell>
                              <TableCell>
                                {format(parseISO(shift.startTime), 'HH:mm')} - 
                                {format(parseISO(shift.endTime), 'HH:mm')}
                              </TableCell>
                              <TableCell>{shift.position}</TableCell>
                              <TableCell>{shift.location}</TableCell>
                              <TableCell>{shift.trainsAssigned.join(', ')}</TableCell>
                              <TableCell>{getStatusBadge(shift.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}
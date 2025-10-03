"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { RoleGuard } from '@/hooks/use-role-access'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Clock,
  Train,
  Settings,
  CalendarDays,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns'

interface TrainSchedule {
  trainId: string
  trainName: string
  route: string
  departureTime: string
  arrivalTime: string
  status: 'Active' | 'Maintenance' | 'Delayed' | 'Cancelled'
  platform: string
  date: string
}

interface MaintenanceWindow {
  id: string
  trainId: string
  trainName: string
  type: 'Preventive' | 'Corrective' | 'Emergency' | 'AI-Suggested'
  scheduledDate: string
  duration: string
  priority: 'High' | 'Medium' | 'Low'
  description: string
  status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Overdue'
}

interface CalendarEvent {
  date: Date
  events: {
    type: 'train' | 'maintenance'
    data: TrainSchedule | MaintenanceWindow
  }[]
}

export default function OperatorSchedulePage() {
  const { user } = useAuth()
  const [trainSchedules, setTrainSchedules] = useState<TrainSchedule[]>([])
  const [maintenanceWindows, setMaintenanceWindows] = useState<MaintenanceWindow[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchScheduleData()
  }, [])

  const fetchScheduleData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/operator/schedule', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setTrainSchedules(data.trainSchedules || [])
      setMaintenanceWindows(data.maintenanceWindows || [])
      generateCalendarEvents(data.trainSchedules || [], data.maintenanceWindows || [])
    } catch (error) {
      console.error('Error fetching schedule data:', error)
      setError('Failed to load schedule data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const generateCalendarEvents = (schedules: TrainSchedule[], maintenance: MaintenanceWindow[]) => {
    const events: CalendarEvent[] = []
    const today = new Date()
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(addDays(today, 30)) // Next month too

    const daysInRange = eachDayOfInterval({ start: monthStart, end: monthEnd })

    daysInRange.forEach(date => {
      const dayEvents: CalendarEvent['events'] = []

      // Add train schedules for this date
      schedules.forEach(schedule => {
        if (isSameDay(parseISO(schedule.date), date)) {
          dayEvents.push({
            type: 'train',
            data: schedule
          })
        }
      })

      // Add maintenance windows for this date
      maintenance.forEach(maint => {
        if (isSameDay(parseISO(maint.scheduledDate), date)) {
          dayEvents.push({
            type: 'maintenance',
            data: maint
          })
        }
      })

      if (dayEvents.length > 0) {
        events.push({
          date,
          events: dayEvents
        })
      }
    })

    setCalendarEvents(events)
  }

  const filteredSchedules = trainSchedules.filter(schedule => {
    const matchesSearch = schedule.trainId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.trainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.route.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredMaintenance = maintenanceWindows.filter(maint => {
    const matchesSearch = maint.trainId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maint.trainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maint.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || maint.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      'Active': { variant: 'default', icon: CheckCircle },
      'Maintenance': { variant: 'secondary', icon: Settings },
      'Delayed': { variant: 'destructive', icon: AlertTriangle },
      'Cancelled': { variant: 'destructive', icon: XCircle },
      'Scheduled': { variant: 'outline', icon: Clock },
      'In-Progress': { variant: 'default', icon: Settings },
      'Completed': { variant: 'default', icon: CheckCircle },
      'Overdue': { variant: 'destructive', icon: AlertTriangle },
    }

    const config = variants[status] || variants['Active']
    const IconComponent = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      'High': 'destructive',
      'Medium': 'secondary',
      'Low': 'outline',
    }

    return (
      <Badge variant={variants[priority] as any}>
        {priority}
      </Badge>
    )
  }

  const getSelectedDateEvents = () => {
    return calendarEvents.find(event => isSameDay(event.date, selectedDate))?.events || []
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Schedule Data...</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Schedule</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchScheduleData}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <RoleGuard role="Operator">
      <div className="min-h-screen bg-gray-50">
        <div className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="h-6 w-6 text-green-600" />
                Train Schedule & Maintenance Windows
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                AI-powered train roster, maintenance schedules, and operational calendar for {user?.name}
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search trains, routes, or maintenance..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'Active' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('Active')}
                  size="sm"
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === 'Maintenance' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('Maintenance')}
                  size="sm"
                >
                  Maintenance
                </Button>
                <Button
                  variant={statusFilter === 'Overdue' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('Overdue')}
                  size="sm"
                >
                  Overdue
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="calendar" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Calendar View
                </TabsTrigger>
                <TabsTrigger value="roster" className="flex items-center gap-2">
                  <Train className="h-4 w-4" />
                  Train Roster
                </TabsTrigger>
                <TabsTrigger value="maintenance" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Maintenance Windows
                </TabsTrigger>
              </TabsList>

              {/* Calendar View */}
              <TabsContent value="calendar" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Calendar */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        AI-Predicted Monthly Schedule
                      </CardTitle>
                      <CardDescription>
                        Click on any date to view scheduled trains and maintenance windows
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        className="rounded-md border"
                        modifiers={{
                          hasEvents: calendarEvents.map(event => event.date)
                        }}
                        modifiersStyles={{
                          hasEvents: { backgroundColor: '#dcfce7', fontWeight: 'bold' }
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* Selected Date Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {format(selectedDate, 'MMMM dd, yyyy')}
                      </CardTitle>
                      <CardDescription>
                        Schedule for selected date
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {getSelectedDateEvents().length === 0 ? (
                          <p className="text-gray-500 text-center py-4">
                            No events scheduled for this date
                          </p>
                        ) : (
                          getSelectedDateEvents().map((event, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              {event.type === 'train' ? (
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">{(event.data as TrainSchedule).trainId}</span>
                                    {getStatusBadge((event.data as TrainSchedule).status)}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {(event.data as TrainSchedule).route}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {(event.data as TrainSchedule).departureTime} - {(event.data as TrainSchedule).arrivalTime}
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">{(event.data as MaintenanceWindow).trainId}</span>
                                    {getPriorityBadge((event.data as MaintenanceWindow).priority)}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {(event.data as MaintenanceWindow).type} Maintenance
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Duration: {(event.data as MaintenanceWindow).duration}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Train Roster */}
              <TabsContent value="roster">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Train className="h-5 w-5" />
                      Train Roster
                    </CardTitle>
                    <CardDescription>
                      Complete schedule of train operations with real-time status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Train ID</TableHead>
                            <TableHead>Train Name</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Departure</TableHead>
                            <TableHead>Arrival</TableHead>
                            <TableHead>Platform</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSchedules.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                No train schedules found matching your criteria
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredSchedules.map((schedule, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{schedule.trainId}</TableCell>
                                <TableCell>{schedule.trainName}</TableCell>
                                <TableCell>{schedule.route}</TableCell>
                                <TableCell>{format(parseISO(schedule.date), 'MMM dd, yyyy')}</TableCell>
                                <TableCell>{schedule.departureTime}</TableCell>
                                <TableCell>{schedule.arrivalTime}</TableCell>
                                <TableCell>{schedule.platform}</TableCell>
                                <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Maintenance Windows */}
              <TabsContent value="maintenance">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Maintenance Windows
                    </CardTitle>
                    <CardDescription>
                      AI-suggested maintenance schedules and operational blocks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Train ID</TableHead>
                            <TableHead>Train Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Scheduled Date</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMaintenance.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                No maintenance windows found matching your criteria
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredMaintenance.map((maint, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{maint.trainId}</TableCell>
                                <TableCell>{maint.trainName}</TableCell>
                                <TableCell>
                                  <Badge variant={maint.type === 'AI-Suggested' ? 'default' : 'secondary'}>
                                    {maint.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>{format(parseISO(maint.scheduledDate), 'MMM dd, yyyy')}</TableCell>
                                <TableCell>{maint.duration}</TableCell>
                                <TableCell>{getPriorityBadge(maint.priority)}</TableCell>
                                <TableCell>{getStatusBadge(maint.status)}</TableCell>
                                <TableCell className="max-w-xs truncate">{maint.description}</TableCell>
                              </TableRow>
                            ))
                          )}
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
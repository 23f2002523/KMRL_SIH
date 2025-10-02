"use client"

import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Shield, 
  User, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Database,
  Lock
} from 'lucide-react'

interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  userRole: string
  action: string
  resource: string
  details: string
  ipAddress: string
  userAgent: string
  status: 'success' | 'failed' | 'warning'
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface SecurityEvent {
  id: string
  timestamp: string
  eventType: string
  userId?: string
  userName?: string
  ipAddress: string
  description: string
  status: 'detected' | 'blocked' | 'resolved'
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export default function AdminAuditPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterUser, setFilterUser] = useState('all')
  const [filterAction, setFilterAction] = useState('all')
  const [filterTimeRange, setFilterTimeRange] = useState('today')

  const [auditLogs] = useState<AuditLog[]>([
    {
      id: 'AUD-001',
      timestamp: '2024-01-15 14:30:25',
      userId: 'USR-002',
      userName: 'Train Operator',
      userRole: 'Operator',
      action: 'Train Control',
      resource: 'KMRL-001',
      details: 'Started train operation from Aluva station',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 Chrome/120.0',
      status: 'success',
      severity: 'medium'
    },
    {
      id: 'AUD-002',
      timestamp: '2024-01-15 14:25:12',
      userId: 'USR-001',
      userName: 'System Admin',
      userRole: 'Admin',
      action: 'User Management',
      resource: 'User Settings',
      details: 'Modified operator permissions for USR-002',
      ipAddress: '192.168.1.50',
      userAgent: 'Mozilla/5.0 Chrome/120.0',
      status: 'success',
      severity: 'high'
    },
    {
      id: 'AUD-003',
      timestamp: '2024-01-15 14:20:45',
      userId: 'USR-003',
      userName: 'Unknown User',
      userRole: 'Unknown',
      action: 'Login Attempt',
      resource: 'Authentication',
      details: 'Failed login attempt with invalid credentials',
      ipAddress: '203.192.15.25',
      userAgent: 'Mozilla/5.0 Firefox/120.0',
      status: 'failed',
      severity: 'critical'
    }
  ])

  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: 'SEC-001',
      timestamp: '2024-01-15 14:22:10',
      eventType: 'Suspicious Login',
      userId: 'USR-003',
      userName: 'Unknown User',
      ipAddress: '203.192.15.25',
      description: 'Multiple failed login attempts from foreign IP',
      status: 'blocked',
      severity: 'critical'
    },
    {
      id: 'SEC-002',
      timestamp: '2024-01-15 13:45:30',
      eventType: 'Permission Escalation',
      userId: 'USR-002',
      userName: 'Train Operator',
      ipAddress: '192.168.1.100',
      description: 'Attempted to access admin-only features',
      status: 'detected',
      severity: 'medium'
    }
  ])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (user?.role !== 'Admin') {
      router.push('/')
      return
    }
  }, [isAuthenticated, user, router])

  if (!user || user.role !== 'Admin') {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': case 'resolved': return 'bg-green-500'
      case 'failed': case 'blocked': return 'bg-red-500'
      case 'warning': case 'detected': return 'bg-yellow-500'
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

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login attempt': case 'authentication': return <Lock className="h-4 w-4" />
      case 'user management': return <User className="h-4 w-4" />
      case 'train control': return <Settings className="h-4 w-4" />
      case 'system settings': return <Shield className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">Monitor system activity and security events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filter
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-blue-600">1,247</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Security Events</p>
                <p className="text-2xl font-bold text-red-600">23</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold text-yellow-600">8</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-green-600">3</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="operator">Operators</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="user_mgmt">User Management</SelectItem>
                <SelectItem value="train_control">Train Control</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTimeRange} onValueChange={setFilterTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Today" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="system">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Logs</CardTitle>
              <CardDescription>
                Detailed log of all user actions and system interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {getActionIcon(log.action)}
                            <span className="font-medium">{log.userName}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {log.userRole}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell className="max-w-48 truncate" title={log.details}>
                        {log.details}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(log.status)} text-white capitalize`}
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`${getSeverityColor(log.severity)} text-white capitalize`}
                        >
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Security Events
              </CardTitle>
              <CardDescription>
                Critical security events and potential threats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-mono text-sm">{event.timestamp}</TableCell>
                      <TableCell className="font-medium">{event.eventType}</TableCell>
                      <TableCell>
                        {event.userName || 'Unknown'}
                        {event.userId && (
                          <div className="text-xs text-gray-500">{event.userId}</div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{event.ipAddress}</TableCell>
                      <TableCell className="max-w-48 truncate" title={event.description}>
                        {event.description}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(event.status)} text-white capitalize`}
                        >
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`${getSeverityColor(event.severity)} text-white capitalize`}
                        >
                          {event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          {event.status === 'detected' && (
                            <Button size="sm" variant="outline" className="text-red-600">
                              Block
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Logs
              </CardTitle>
              <CardDescription>
                System events, errors, and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <h3 className="font-medium text-green-800">System Backup Completed</h3>
                      <p className="text-sm text-green-600">Daily backup completed successfully at 02:00:00</p>
                      <p className="text-xs text-green-500 mt-1">2024-01-15 02:00:15 | Size: 2.4 GB</p>
                    </div>
                    <Badge className="bg-green-500">Success</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div className="flex-1">
                      <h3 className="font-medium text-yellow-800">High Memory Usage</h3>
                      <p className="text-sm text-yellow-600">System memory usage reached 85% threshold</p>
                      <p className="text-xs text-yellow-500 mt-1">2024-01-15 13:45:30 | Memory: 85.2%</p>
                    </div>
                    <Badge className="bg-yellow-500">Warning</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-800">Scheduled Maintenance</h3>
                      <p className="text-sm text-blue-600">System maintenance scheduled for tomorrow at 02:00</p>
                      <p className="text-xs text-blue-500 mt-1">2024-01-16 02:00:00 | Duration: 2 hours</p>
                    </div>
                    <Badge className="bg-blue-500">Scheduled</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admin Access Notice */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Administrator Audit Access
          </CardTitle>
          <CardDescription className="text-red-600">
            Comprehensive system audit trails are available only to administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium text-gray-900">Activity Monitoring</h3>
              <p className="text-sm text-gray-600 mt-1">Track all user actions and system interactions</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium text-gray-900">Security Analysis</h3>
              <p className="text-sm text-gray-600 mt-1">Monitor threats and security incidents</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium text-gray-900">Compliance Reporting</h3>
              <p className="text-sm text-gray-600 mt-1">Generate compliance and audit reports</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
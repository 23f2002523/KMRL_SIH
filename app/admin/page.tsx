"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useApiClient } from '@/hooks/use-api-client'
import { AdminOnly, RoleBadge } from '@/hooks/use-role-access'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Users, 
  Shield, 
  Settings, 
  Activity, 
  BarChart3, 
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Eye,
  Database,
  Server,
  Lock,
  Calendar,
  PieChart
} from 'lucide-react'
import AdminMaintenanceSchedule from '@/components/admin/admin-maintenance-schedule'
import AdminStatusCharts from '@/components/admin/admin-status-charts'

interface User {
  userId: number
  name: string
  email: string
  role: 'Admin' | 'Operator' | 'Viewer'
  createdAt: string
  updatedAt: string
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const apiClient = useApiClient()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalRequests: 0,
    errorRate: 0,
    uptime: '99.9%'
  })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/api/admin/users')
      setUsers(response.data.users || [])
      setSystemStats(prev => ({ ...prev, totalUsers: response.data.users?.length || 0 }))
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
    setLoading(false)
  }

  const fetchLogs = async () => {
    try {
      const response = await apiClient.get('/api/logs?limit=50')
      setLogs(response.data.logs || [])
      
      // Calculate stats from logs
      const totalRequests = response.data.logs?.length || 0
      const errorRequests = response.data.logs?.filter((log: any) => log.status >= 400).length || 0
      const errorRate = totalRequests > 0 ? ((errorRequests / totalRequests) * 100).toFixed(1) : '0'
      
      setSystemStats(prev => ({ 
        ...prev, 
        totalRequests,
        errorRate: parseFloat(errorRate)
      }))
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

  const deleteUser = async (userId: number) => {
    try {
      await apiClient.delete(`/api/admin/users/${userId}`)
      await fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchUsers()
      fetchLogs()
    }
  }, [user])

  return (
    <AdminOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <CardTitle className="text-red-800">Admin Access Required</CardTitle>
              <CardDescription>
                This dashboard is only accessible to users with Admin role.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <RoleBadge role={user?.role || 'Unknown'} />
              <p className="mt-4 text-sm text-gray-600">
                Your current role: {user?.role || 'Not logged in'}
              </p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              System administration and user management
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Administrator</p>
            <p className="font-semibold">{user?.name}</p>
            <RoleBadge role="Admin" />
          </div>
        </div>

        {/* System Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Active system users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalRequests}</div>
              <p className="text-xs text-muted-foreground">
                Total requests logged
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.errorRate}%</div>
              <p className="text-xs text-muted-foreground">
                4xx & 5xx responses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.uptime}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="maintenance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="maintenance">
              <Calendar className="h-4 w-4 mr-2" />
              Maintenance Schedule
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <PieChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          {/* Maintenance Schedule */}
          <TabsContent value="maintenance" className="space-y-4">
            <AdminMaintenanceSchedule />
          </TabsContent>

          {/* Analytics Dashboard */}
          <TabsContent value="analytics" className="space-y-4">
            <AdminStatusCharts />
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      User Management
                    </CardTitle>
                    <CardDescription>
                      Manage system users and their roles
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div 
                        key={user.userId}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            <p className="text-xs text-gray-500">
                              Created: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <RoleBadge role={user.role} />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {user.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteUser(user.userId)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Logs */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  System Logs
                </CardTitle>
                <CardDescription>
                  Recent API requests and system activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded text-sm font-mono ${
                        log.status >= 500 ? 'bg-red-50 dark:bg-red-900/20' :
                        log.status >= 400 ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                        'bg-green-50 dark:bg-green-900/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          {log.method} {log.url}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            log.status >= 500 ? 'destructive' :
                            log.status >= 400 ? 'secondary' :
                            'default'
                          }>
                            {log.status}
                          </Badge>
                          <span className="text-xs">{log.duration}ms</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(log.timestamp).toLocaleString()} | 
                        IP: {log.ip} | 
                        User: {log.userId || 'Anonymous'} |
                        ID: {log.requestId}
                      </div>
                      {log.error && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Error: {log.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  System-wide settings and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxUsers">Maximum Users</Label>
                    <Input id="maxUsers" defaultValue="100" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input id="sessionTimeout" defaultValue="60" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logRetention">Log Retention (days)</Label>
                    <Input id="logRetention" defaultValue="30" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apiRateLimit">API Rate Limit (per minute)</Label>
                    <Input id="apiRateLimit" defaultValue="1000" />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Security Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Require 2FA for all users</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Password Policy</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Minimum requirements for passwords</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Login Attempt Limits</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Maximum failed login attempts before lockout</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full">Save Configuration</Button>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </AdminOnly>
  )
}
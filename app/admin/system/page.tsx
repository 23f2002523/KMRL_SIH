"use client"

import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  Shield, 
  Database, 
  Bell, 
  Globe, 
  Clock, 
  Save,
  AlertTriangle,
  CheckCircle,
  Server,
  Lock,
  Wifi
} from 'lucide-react'

export default function AdminSystemPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  
  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    autoBackup: true,
    emailNotifications: true,
    smsAlerts: false,
    systemTimeout: 30,
    maxLoginAttempts: 3,
    sessionTimeout: 120,
    enableAuditLog: true,
    enableTwoFactor: false,
    allowOperatorOverride: true
  })

  const [systemStatus] = useState({
    database: { status: 'healthy', lastBackup: '2024-01-15 02:00:00' },
    api: { status: 'healthy', responseTime: '45ms' },
    trainControl: { status: 'healthy', activeConnections: 3 },
    notifications: { status: 'healthy', queueSize: 12 },
    storage: { status: 'warning', usedSpace: '78%' },
    security: { status: 'healthy', lastScan: '2024-01-15 01:30:00' }
  })

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

  const handleSettingChange = (key: string, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <AlertTriangle className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure system-wide settings and monitor system health</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(systemStatus).map(([key, status]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(status.status)}`}>
                    {getStatusIcon(status.status)}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{key}</p>
                    <p className="text-sm text-gray-600 capitalize">{status.status}</p>
                  </div>
                </div>
                <Badge 
                  variant={status.status === 'healthy' ? 'default' : status.status === 'warning' ? 'secondary' : 'destructive'}
                  className="capitalize"
                >
                  {status.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup & Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General System Settings
              </CardTitle>
              <CardDescription>
                Configure basic system behavior and operational parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Maintenance Mode</Label>
                      <p className="text-sm text-gray-600">Put system in maintenance mode</p>
                    </div>
                    <Switch 
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Allow Operator Override</Label>
                      <p className="text-sm text-gray-600">Allow operators to override certain restrictions</p>
                    </div>
                    <Switch 
                      checked={systemSettings.allowOperatorOverride}
                      onCheckedChange={(checked) => handleSettingChange('allowOperatorOverride', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timeout" className="text-base font-medium">System Timeout (minutes)</Label>
                    <p className="text-sm text-gray-600 mb-2">Automatic system timeout for inactive sessions</p>
                    <Input 
                      id="timeout"
                      type="number" 
                      value={systemSettings.systemTimeout}
                      onChange={(e) => handleSettingChange('systemTimeout', parseInt(e.target.value))}
                      className="w-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="session" className="text-base font-medium">Session Timeout (minutes)</Label>
                    <p className="text-sm text-gray-600 mb-2">User session expiration time</p>
                    <Input 
                      id="session"
                      type="number" 
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure authentication and security policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Changes to security settings will affect all users and may require re-authentication.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Enable Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-600">Require 2FA for all admin accounts</p>
                    </div>
                    <Switch 
                      checked={systemSettings.enableTwoFactor}
                      onCheckedChange={(checked) => handleSettingChange('enableTwoFactor', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Enable Audit Logging</Label>
                      <p className="text-sm text-gray-600">Log all system activities and changes</p>
                    </div>
                    <Switch 
                      checked={systemSettings.enableAuditLog}
                      onCheckedChange={(checked) => handleSettingChange('enableAuditLog', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="attempts" className="text-base font-medium">Max Login Attempts</Label>
                    <p className="text-sm text-gray-600 mb-2">Lock account after failed attempts</p>
                    <Input 
                      id="attempts"
                      type="number" 
                      value={systemSettings.maxLoginAttempts}
                      onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Current Security Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">SSL Certificate Valid</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">Expires: March 15, 2024</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Firewall Active</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">Last scan: 2 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Send system alerts via email</p>
                    </div>
                    <Switch 
                      checked={systemSettings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">SMS Alerts</Label>
                      <p className="text-sm text-gray-600">Send critical alerts via SMS</p>
                    </div>
                    <Switch 
                      checked={systemSettings.smsAlerts}
                      onCheckedChange={(checked) => handleSettingChange('smsAlerts', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-800 mb-2">Notification Types</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>System Errors</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex justify-between">
                        <span>Train Incidents</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex justify-between">
                        <span>Maintenance Alerts</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex justify-between">
                        <span>Security Events</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup & Maintenance
              </CardTitle>
              <CardDescription>
                Configure automatic backups and system maintenance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <Label className="text-base font-medium text-green-800">Automatic Backup</Label>
                  <p className="text-sm text-green-600">Daily backup at 2:00 AM</p>
                </div>
                <Switch 
                  checked={systemSettings.autoBackup}
                  onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Backup Status</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Last Backup</span>
                        <span className="font-medium">Jan 15, 2024 02:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Backup Size</span>
                        <span className="font-medium">2.4 GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage Location</span>
                        <span className="font-medium">AWS S3</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retention Period</span>
                        <span className="font-medium">30 days</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Create Manual Backup
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">System Maintenance</h3>
                    <div className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <Server className="h-4 w-4 mr-2" />
                        Clear System Cache
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Optimize Database
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Wifi className="h-4 w-4 mr-2" />
                        Test Connections
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admin-only Warning */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Administrator Access Required
          </CardTitle>
          <CardDescription className="text-red-600">
            These settings can only be modified by system administrators and affect the entire KMRL system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-700">
            <p>⚠️ Changes to system settings will be applied immediately and may affect all users.</p>
            <p>⚠️ Always create a backup before making significant configuration changes.</p>
            <p>⚠️ Some changes may require system restart to take effect.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
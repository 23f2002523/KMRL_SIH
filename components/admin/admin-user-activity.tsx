"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, LogIn, LogOut } from 'lucide-react'

export function AdminUserActivity() {
  const recentActivity = [
    {
      id: 1,
      user: 'Rajesh Kumar',
      role: 'Operator',
      action: 'Login',
      timestamp: '2 minutes ago',
      details: 'Train Control Dashboard',
      type: 'login',
    },
    {
      id: 2,
      user: 'Priya Nair',
      role: 'Admin',
      action: 'System Update',
      timestamp: '15 minutes ago',
      details: 'Updated TS005 maintenance schedule',
      type: 'update',
    },
    {
      id: 3,
      user: 'Amit Sharma',
      role: 'Operator',
      action: 'Alert Response',
      timestamp: '32 minutes ago',
      details: 'Acknowledged brake system alert TS012',
      type: 'alert',
    },
    {
      id: 4,
      user: 'Sunita Menon',
      role: 'Admin',
      action: 'User Management',
      timestamp: '1 hour ago',
      details: 'Created new operator account',
      type: 'user',
    },
    {
      id: 5,
      user: 'Kiran Joshi',
      role: 'Operator',
      action: 'Logout',
      timestamp: '1 hour ago',
      details: 'End of shift',
      type: 'logout',
    },
  ]

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'login': return <LogIn className="h-4 w-4 text-green-600" />
      case 'logout': return <LogOut className="h-4 w-4 text-gray-600" />
      default: return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'login': return <Badge className="bg-green-100 text-green-800">Login</Badge>
      case 'logout': return <Badge className="bg-gray-100 text-gray-800">Logout</Badge>
      case 'alert': return <Badge className="bg-red-100 text-red-800">Alert</Badge>
      case 'update': return <Badge className="bg-blue-100 text-blue-800">Update</Badge>
      case 'user': return <Badge className="bg-purple-100 text-purple-800">User Mgmt</Badge>
      default: return <Badge variant="secondary">Action</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Recent User Activity & System Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white border border-gray-200 rounded-md">
                  {getActionIcon(activity.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{activity.user}</span>
                    <Badge variant={activity.role === 'Admin' ? 'default' : 'secondary'}>
                      {activity.role}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">{activity.details}</div>
                </div>
              </div>
              <div className="text-right">
                {getActionBadge(activity.type)}
                <div className="text-xs text-gray-500 mt-1">{activity.timestamp}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">12</div>
            <div className="text-xs text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">156</div>
            <div className="text-xs text-gray-600">Today's Actions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">99.8%</div>
            <div className="text-xs text-gray-600">System Uptime</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
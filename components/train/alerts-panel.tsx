"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Zap, 
  MapPin, 
  Bell,
  CheckCircle,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Alert {
  id: string
  type: "warning" | "error" | "info" | "critical"
  title: string
  message: string
  trainsetId?: number
  serialNo?: string
  timestamp: Date
  isRead: boolean
  actionRequired: boolean
}

interface AlertsPanelProps {
  alerts: Alert[]
  onMarkAsRead: (alertId: string) => void
  onDismissAlert: (alertId: string) => void
  onMarkAllAsRead: () => void
}

function getAlertIcon(type: "warning" | "error" | "info" | "critical") {
  const iconClass = "h-4 w-4"
  
  switch (type) {
    case "critical":
      return <XCircle className={`${iconClass} text-red-600`} />
    case "error":
      return <XCircle className={`${iconClass} text-red-500`} />
    case "warning":
      return <AlertTriangle className={`${iconClass} text-yellow-500`} />
    case "info":
      return <Bell className={`${iconClass} text-blue-500`} />
  }
}

function getAlertBadge(type: "warning" | "error" | "info" | "critical") {
  const badgeConfig = {
    critical: "bg-red-100 text-red-800 border-red-200",
    error: "bg-red-100 text-red-700 border-red-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
  }
  
  return (
    <Badge variant="outline" className={badgeConfig[type]}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  )
}

function getTimeAgo(timestamp: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export function AlertsPanel({ 
  alerts, 
  onMarkAsRead, 
  onDismissAlert, 
  onMarkAllAsRead 
}: AlertsPanelProps) {
  const unreadCount = alerts.filter(alert => !alert.isRead).length
  const criticalCount = alerts.filter(alert => alert.type === "critical").length

  // Sort alerts by timestamp (newest first) and priority (critical first)
  const sortedAlerts = [...alerts].sort((a, b) => {
    if (a.type === "critical" && b.type !== "critical") return -1
    if (b.type === "critical" && a.type !== "critical") return 1
    return b.timestamp.getTime() - a.timestamp.getTime()
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-orange-600" />
            <span>Alerts & Notifications</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onMarkAllAsRead}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Mark All Read
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-500">
              No alerts or notifications at this time
            </p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {criticalCount}
                </div>
                <div className="text-xs text-gray-600">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {alerts.filter(a => a.actionRequired).length}
                </div>
                <div className="text-xs text-gray-600">Action Required</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {alerts.length}
                </div>
                <div className="text-xs text-gray-600">Total Alerts</div>
              </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sortedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "relative p-3 rounded-lg border transition-all duration-200",
                    alert.isRead 
                      ? "bg-gray-50 border-gray-200" 
                      : "bg-white border-l-4",
                    !alert.isRead && alert.type === "critical" && "border-l-red-500 bg-red-50",
                    !alert.isRead && alert.type === "error" && "border-l-red-400 bg-red-50",
                    !alert.isRead && alert.type === "warning" && "border-l-yellow-400 bg-yellow-50", 
                    !alert.isRead && alert.type === "info" && "border-l-blue-400 bg-blue-50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Alert Icon */}
                      <div className="mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      
                      {/* Alert Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={cn(
                            "text-sm font-medium",
                            alert.isRead ? "text-gray-600" : "text-gray-900"
                          )}>
                            {alert.title}
                          </h4>
                          {getAlertBadge(alert.type)}
                          {alert.actionRequired && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              Action Required
                            </Badge>
                          )}
                        </div>
                        
                        <p className={cn(
                          "text-sm mb-2",
                          alert.isRead ? "text-gray-500" : "text-gray-700"
                        )}>
                          {alert.message}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{getTimeAgo(alert.timestamp)}</span>
                          {alert.trainsetId && alert.serialNo && (
                            <span className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{alert.serialNo} (#{alert.trainsetId})</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-1 ml-2">
                      {!alert.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMarkAsRead(alert.id)}
                          className="h-6 w-6 p-0"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDismissAlert(alert.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
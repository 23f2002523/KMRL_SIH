"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { AlertsPanel } from "@/components/train/alerts-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  RefreshCw,
  Filter
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

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

export default function AlertsPage() {
  const { t } = useLanguage()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'action-required'>('all')

  useEffect(() => {
    fetchAlertsData()
  }, [])

  const fetchAlertsData = async () => {
    setLoading(true)
    try {
      // In a real app, this would fetch from an API
      // For now, using mock data
      const mockAlerts: Alert[] = [
        {
          id: "alert-1",
          type: "warning",
          title: "Branding Exposure Alert",
          message: "⚠️ Trainset #12 branding exposure at 70%, SLA breach risk",
          trainsetId: 12,
          serialNo: "KMRL-2024-012",
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          isRead: false,
          actionRequired: true
        },
        {
          id: "alert-2", 
          type: "critical",
          title: "Fitness Certificate Expired",
          message: "🚨 Trainset #8 fitness certificate expired 2 days ago - immediate action required",
          trainsetId: 8,
          serialNo: "KMRL-2023-008",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          isRead: false,
          actionRequired: true
        },
        {
          id: "alert-3",
          type: "error", 
          title: "Maintenance Overdue",
          message: "Trainset #5 scheduled maintenance overdue by 48 hours",
          trainsetId: 5,
          serialNo: "KMRL-2023-005",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          isRead: false,
          actionRequired: true
        },
        {
          id: "alert-4",
          type: "warning",
          title: "Depot Capacity Alert",
          message: "Depot 3 approaching 85% capacity - induction scheduling may be affected",
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          isRead: true,
          actionRequired: false
        },
        {
          id: "alert-5",
          type: "info",
          title: "Cleaning Slot Updated",
          message: "Trainset #15 cleaning slot rescheduled to 14:00-16:00 today",
          trainsetId: 15,
          serialNo: "KMRL-2024-015",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          isRead: true,
          actionRequired: false
        },
        {
          id: "alert-6",
          type: "critical",
          title: "Emergency Brake System Alert",
          message: "🚨 Trainset #3 emergency brake system requires immediate inspection",
          trainsetId: 3,
          serialNo: "KMRL-2023-003",
          timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
          isRead: false,
          actionRequired: true
        },
        {
          id: "alert-7",
          type: "warning",
          title: "Low Fuel Alert",
          message: "Trainset #7 fuel level below 20% - refueling required",
          trainsetId: 7,
          serialNo: "KMRL-2024-007",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          isRead: false,
          actionRequired: true
        },
        {
          id: "alert-8",
          type: "info",
          title: "Scheduled Maintenance Complete",
          message: "Trainset #9 scheduled maintenance completed successfully",
          trainsetId: 9,
          serialNo: "KMRL-2024-009",
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          isRead: true,
          actionRequired: false
        }
      ]
      
      setAlerts(mockAlerts)
    } catch (error) {
      console.error('Error fetching alerts data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ))
  }

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const handleMarkAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })))
  }

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'unread':
        return !alert.isRead
      case 'critical':
        return alert.type === 'critical'
      case 'action-required':
        return alert.actionRequired
      default:
        return true
    }
  })

  const alertCounts = {
    total: alerts.length,
    unread: alerts.filter(a => !a.isRead).length,
    critical: alerts.filter(a => a.type === 'critical').length,
    actionRequired: alerts.filter(a => a.actionRequired).length
  }

  if (loading) {
    return (
      <MainLayout alertCount={alertCounts.unread}>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">{t('dashboard.loadingAlerts', 'Loading alerts...')}</p>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout alertCount={alertCounts.unread}>
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.notifications', 'Alerts & Notifications')}</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('dashboard.monitorSystemAlerts', 'Monitor system alerts, warnings, and critical notifications')}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={fetchAlertsData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Alerts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{alertCounts.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{alertCounts.critical}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread</p>
                  <p className="text-2xl font-bold text-orange-600">{alertCounts.unread}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Action Required</p>
                  <p className="text-2xl font-bold text-purple-600">{alertCounts.actionRequired}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Alerts', count: alertCounts.total },
                { key: 'unread', label: 'Unread', count: alertCounts.unread },
                { key: 'critical', label: 'Critical', count: alertCounts.critical },
                { key: 'action-required', label: 'Action Required', count: alertCounts.actionRequired }
              ].map(({ key, label, count }) => (
                <Button
                  key={key}
                  variant={filter === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(key as any)}
                  className="flex items-center space-x-2"
                >
                  <span>{label}</span>
                  <Badge variant="secondary" className="ml-1">
                    {count}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <AlertsPanel
          alerts={filteredAlerts}
          onMarkAsRead={handleMarkAsRead}
          onDismissAlert={handleDismissAlert}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      </div>
    </MainLayout>
  )
}
"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { EnhancedTrainMetricsCards } from "@/components/train/enhanced-train-metrics-cards"
import { TrainStatusTable } from "@/components/train/train-status-table"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { DashboardSkeleton } from "@/components/ui/enhanced-skeleton"
import { customToast } from "@/components/ui/toast-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Crown, 
  Shield, 
  Eye, 
  BarChart3, 
  Settings,
  Users,
  Bell,
  Upload,
  Search,
  Workflow,
  Archive,
  Zap
} from "lucide-react"
import Link from "next/link"

interface Trainset {
  id: number
  serialNumber: string
  modelType: string
  manufacturer: string
  yearManufactured: number
  currentLocation: string
  status: 'active' | 'maintenance' | 'reserve' | 'inactive'
  lastInspection?: Date
  nextInspection?: Date
  totalDistance?: number
  operationalHours?: number
}

interface Metrics {
  totalTrainsets: number
  readyForService: number
  standby: number
  maintenance: number
  alerts: number
}

function QuickAccessPanel() {
  const { user } = useAuth()

  const adminItems = [
    { title: "Admin Dashboard", href: "/admin", icon: Crown, description: "System administration", badge: "New" },
    { title: "User Management", href: "/admin/users", icon: Shield, description: "Manage system users" },
  ]

  const demoItems = [
    { title: "RBAC Demo", href: "/rbac-demo", icon: Eye, description: "Role-based access control", badge: "Demo" },
    { title: "Error Testing", href: "/error-test", icon: Bell, description: "Error handling test", badge: "Test" },
  ]

  const quickItems = [
    { title: "Upload", href: "/upload", icon: Upload, description: "Upload files" },
    { title: "Search", href: "/search", icon: Search, description: "Search content" },
    { title: "Users", href: "/users", icon: Users, description: "View users" },
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Access
        </h2>
        <Badge variant="outline" className="text-xs">
          Role: {user?.role}
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Admin Section */}
        {user?.role === 'Admin' && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Administration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {adminItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <item.icon className="h-4 w-4" />
                        {item.title}
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs">{item.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Demo Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Demo & Testing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {demoItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <item.icon className="h-4 w-4" />
                      {item.title}
                      {item.badge && (
                        <Badge variant="outline" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Features */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Main Features
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function OverviewPage() {
  const { t } = useLanguage()
  const [metrics, setMetrics] = useState<Metrics>({
    totalTrainsets: 0,
    readyForService: 0,
    standby: 0,
    maintenance: 0,
    alerts: 0
  })
  const [trainsets, setTrainsets] = useState<Trainset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverviewData()
  }, [])

  const fetchOverviewData = async () => {
    setLoading(true)
    try {
      // Fetch trainsets
      const trainsetsResponse = await fetch('/api/train/trainsets')
      const trainsetsData = await trainsetsResponse.json()
      
      if (trainsetsData.success && Array.isArray(trainsetsData.data)) {
        // Ensure all trainset objects have required properties
        const safeTrainsets = trainsetsData.data.map((t: any) => ({
          id: t.id || 0,
          serialNumber: t.serialNumber || 'N/A',
          modelType: t.modelType || 'Unknown',
          manufacturer: t.manufacturer || 'Unknown',
          yearManufactured: t.yearManufactured || 0,
          currentLocation: t.currentLocation || 'Unknown',
          status: t.status || 'inactive',
          lastInspection: t.lastInspection ? new Date(t.lastInspection) : undefined,
          nextInspection: t.nextInspection ? new Date(t.nextInspection) : undefined,
          totalDistance: t.totalDistance || 0,
          operationalHours: t.operationalHours || 0
        }))
        
        setTrainsets(safeTrainsets)
        
        // Calculate metrics from trainsets data
        const total = safeTrainsets.length
        const active = safeTrainsets.filter((t: Trainset) => t.status === 'active').length
        const maintenance = safeTrainsets.filter((t: Trainset) => t.status === 'maintenance').length
        const reserve = safeTrainsets.filter((t: Trainset) => t.status === 'reserve').length
        const alertsCount = 5 // Mock data - would come from alerts calculation
        
        setMetrics({
          totalTrainsets: total,
          readyForService: active,
          standby: reserve,
          maintenance: maintenance,
          alerts: alertsCount
        })
      } else {
        // Fallback to mock data if API fails
        console.warn('API returned no data, using mock data')
        const mockTrainsets: Trainset[] = [
          {
            id: 1,
            serialNumber: 'KMRL-2024-001',
            modelType: 'Metro Coach',
            manufacturer: 'BEML',
            yearManufactured: 2024,
            currentLocation: 'Depot 1',
            status: 'active',
            lastInspection: new Date('2024-09-15'),
            nextInspection: new Date('2024-12-15'),
            totalDistance: 15000,
            operationalHours: 2400
          },
          {
            id: 2,
            serialNumber: 'KMRL-2024-002',
            modelType: 'Metro Coach',
            manufacturer: 'BEML',
            yearManufactured: 2024,
            currentLocation: 'Depot 2',
            status: 'maintenance',
            lastInspection: new Date('2024-08-20'),
            nextInspection: new Date('2024-11-20'),
            totalDistance: 12000,
            operationalHours: 1800
          },
          {
            id: 3,
            serialNumber: 'KMRL-2024-003',
            modelType: 'Metro Coach',
            manufacturer: 'BEML',
            yearManufactured: 2024,
            currentLocation: 'Depot 1',
            status: 'reserve',
            lastInspection: new Date('2024-09-10'),
            nextInspection: new Date('2024-12-10'),
            totalDistance: 8000,
            operationalHours: 1200
          }
        ]
        
        setTrainsets(mockTrainsets)
        setMetrics({
          totalTrainsets: mockTrainsets.length,
          readyForService: 1,
          standby: 1,
          maintenance: 1,
          alerts: 2
        })
      }

    } catch (error) {
      console.error('Error fetching overview data:', error)
      
      // Provide fallback data in case of error
      const mockTrainsets: Trainset[] = [
        {
          id: 1,
          serialNumber: 'KMRL-2024-001',
          modelType: 'Metro Coach',
          manufacturer: 'BEML',
          yearManufactured: 2024,
          currentLocation: 'Depot 1',
          status: 'active',
          lastInspection: new Date('2024-09-15'),
          nextInspection: new Date('2024-12-15'),
          totalDistance: 15000,
          operationalHours: 2400
        },
        {
          id: 2,
          serialNumber: 'KMRL-2024-002',
          modelType: 'Metro Coach',
          manufacturer: 'BEML',
          yearManufactured: 2024,
          currentLocation: 'Depot 2',
          status: 'maintenance',
          lastInspection: new Date('2024-08-20'),
          nextInspection: new Date('2024-11-20'),
          totalDistance: 12000,
          operationalHours: 1800
        }
      ]
      
      setTrainsets(mockTrainsets)
      setMetrics({
        totalTrainsets: mockTrainsets.length,
        readyForService: 1,
        standby: 0,
        maintenance: 1,
        alerts: 2
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <MainLayout alertCount={metrics.alerts}>
        <div className="p-8">
          <DashboardSkeleton />
        </div>
      </MainLayout>
    )
  }

  const handleRefreshSuccess = () => {
    customToast.success(t("messages.updateSuccess", "Data refreshed successfully"), t("messages.trainsetUpdated", "Trainset information has been updated"))
  }

  const handleRefreshError = () => {
    customToast.error(t("messages.updateError", "Failed to refresh data"), t("messages.tryAgain", "Please try again in a moment"))
  }

  return (
    <MainLayout alertCount={metrics.alerts}>
      <div className="p-8">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("nav.overview")}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("dashboard.monitorTrainsets", "Monitor all trainsets, their status, and operational metrics")}
          </p>
        </div>

        {/* Enhanced Metrics Cards with Charts */}
        <div className="mb-8">
          <EnhancedTrainMetricsCards metrics={metrics} showCharts={true} />
        </div>

        {/* Quick Access Panel */}
        <QuickAccessPanel />

        {/* Trainset Status Table */}
        <TrainStatusTable 
          trainsets={trainsets}
          onRefresh={() => {
            fetchOverviewData()
              .then(handleRefreshSuccess)
              .catch(handleRefreshError)
          }}
          loading={loading}
        />
      </div>
    </MainLayout>
  )
}

// Wrap the component with authentication protection
export default function ProtectedOverviewPage() {
  return (
    <ProtectedRoute requiredRole="Viewer">
      <OverviewPage />
    </ProtectedRoute>
  )
}
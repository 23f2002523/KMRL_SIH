"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { EnhancedTrainMetricsCards } from "@/components/train/enhanced-train-metrics-cards"
import { TrainStatusTable } from "@/components/train/train-status-table"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { DashboardSkeleton } from "@/components/ui/enhanced-skeleton"
import { customToast } from "@/components/ui/toast-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useLanguage } from "@/hooks/use-language"

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

export default function OverviewPage() {
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
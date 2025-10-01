"use client"

import { useState, useEffect } from "react"
import { TrainDashboardHeader } from "@/components/train/train-dashboard-header"
import { TrainMetricsCards } from "@/components/train/train-metrics-cards"
import { TrainStatusTable } from "@/components/train/train-status-table"
import { InductionPlanSection } from "@/components/train/induction-plan-section"
import { SimulationPanel } from "@/components/train/simulation-panel"
import { AlertsPanel } from "@/components/train/alerts-panel"

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

interface InductionPlan {
  rank: number
  trainsetId: number
  serialNo: string
  decision: "Service" | "Standby" | "Maintenance"
  reason: string
  priority: "High" | "Medium" | "Low"
  estimatedReadyTime?: string
}

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

export default function TrainDashboard() {
  // State management
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [metrics, setMetrics] = useState<Metrics>({
    totalTrainsets: 0,
    readyForService: 0,
    standby: 0,
    maintenance: 0,
    alerts: 0
  })
  const [trainsets, setTrainsets] = useState<Trainset[]>([])
  const [inductionPlans, setInductionPlans] = useState<InductionPlan[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch data on component mount and date change
  useEffect(() => {
    fetchDashboardData()
  }, [selectedDate])

  const fetchDashboardData = async () => {
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
      }

      // Generate mock induction plans based on trainsets
      if (trainsetsData.success && trainsetsData.data.length > 0) {
        const decisions: ("Service" | "Standby" | "Maintenance")[] = ["Service", "Standby", "Maintenance"]
        const priorities: ("High" | "Medium" | "Low")[] = ["High", "Medium", "Low"]
        const reasons = [
          "Fitness certificate valid, ready for service",
          "Reserve capacity management", 
          "Scheduled maintenance required",
          "Branding exposure limit reached",
          "Depot optimization"
        ]
        
        const mockPlans: InductionPlan[] = trainsetsData.data.slice(0, 5).map((trainset: Trainset, index: number) => ({
          rank: index + 1,
          trainsetId: trainset.id,
          serialNo: trainset.serialNumber,
          decision: decisions[index % 3],
          reason: reasons[index],
          priority: priorities[index % 3],
          estimatedReadyTime: index < 3 ? `${14 + index}:30` : undefined
        }))
        setInductionPlans(mockPlans)
      }

      // Generate mock alerts
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
        }
      ]
      setAlerts(mockAlerts)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      
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
      
      // Set mock alerts
      const mockAlerts: Alert[] = [
        {
          id: "alert-1",
          type: "warning",
          title: "System Connection Issue", 
          message: "Unable to connect to train database. Using cached data.",
          timestamp: new Date(),
          isRead: false,
          actionRequired: false
        }
      ]
      setAlerts(mockAlerts)
    } finally {
      setLoading(false)
    }
  }

  // Alert handlers
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

  // Simulation handlers
  const handleRunSimulation = (trainsetId: number, scenarios: string[]) => {
    console.log('Running simulation for trainset:', trainsetId, 'with scenarios:', scenarios)
    // In a real app, this would trigger actual simulation logic
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <TrainDashboardHeader 
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Main Content */}
      <main className="px-6 py-6 space-y-6">
        {/* Metrics Cards */}
        <TrainMetricsCards metrics={metrics} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Train Status Table */}
            <TrainStatusTable 
              trainsets={trainsets}
              onRefresh={fetchDashboardData}
            />

            {/* Induction Plan Section */}
            <InductionPlanSection 
              plans={inductionPlans}
              isGenerating={false}
              onGeneratePlan={fetchDashboardData}
              onExportPlan={() => console.log('Export plan')}
              lastGenerated={new Date()}
            />
          </div>

          {/* Right Column - Side Panels */}
          <div className="space-y-6">
            {/* Alerts Panel */}
            <AlertsPanel
              alerts={alerts}
              onMarkAsRead={handleMarkAsRead}
              onDismissAlert={handleDismissAlert}
              onMarkAllAsRead={handleMarkAllAsRead}
            />

            {/* Simulation Panel */}
            <SimulationPanel
              trainsets={trainsets.map(t => ({
                trainsetId: t.id,
                serialNo: t.serialNumber
              }))}
              onRunSimulation={handleRunSimulation}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
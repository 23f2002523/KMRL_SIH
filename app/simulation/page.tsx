"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { EnhancedSimulation } from "@/components/train/enhanced-simulation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Settings, 
  TrendingUp, 
  Target, 
  Zap,
  RefreshCw,
  BarChart3
} from "lucide-react"

interface Trainset {
  trainsetId: number
  serialNo: string
}

interface SimulationResults {
  changes: Array<{
    trainsetId: number
    serialNo: string
    originalDecision: string
    newDecision: string
    changeReason: string
    impact: "High" | "Medium" | "Low"
  }>
  summary: {
    affectedTrainsets: number
    serviceChanges: number
    standbyChanges: number
    maintenanceChanges: number
    efficiencyGain: number
    costSavings: number
  }
  metrics: {
    beforeOptimization: {
      service: number
      standby: number
      maintenance: number
    }
    afterOptimization: {
      service: number
      standby: number
      maintenance: number
    }
  }
}

export default function SimulationPage() {
  const [trainsets, setTrainsets] = useState<Trainset[]>([])
  const [loading, setLoading] = useState(true)
  const [simulationResults, setSimulationResults] = useState<SimulationResults | undefined>()
  const [lastSimulation, setLastSimulation] = useState<Date | undefined>()
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    fetchSimulationData()
  }, [])

  const fetchSimulationData = async () => {
    setLoading(true)
    try {
      // Fetch trainsets for simulation
      const trainsetsResponse = await fetch('/api/train/trainsets')
      const trainsetsData = await trainsetsResponse.json()
      
      if (trainsetsData.success && Array.isArray(trainsetsData.data)) {
        const trainsetsForSimulation = trainsetsData.data.map((t: any) => ({
          trainsetId: t.id || 0,
          serialNo: t.serialNumber || 'N/A'
        }))
        setTrainsets(trainsetsForSimulation)
      } else {
        // Fallback mock data
        const mockTrainsets: Trainset[] = [
          { trainsetId: 1, serialNo: 'KMRL-2024-001' },
          { trainsetId: 2, serialNo: 'KMRL-2024-002' },
          { trainsetId: 3, serialNo: 'KMRL-2024-003' },
          { trainsetId: 4, serialNo: 'KMRL-2024-004' },
          { trainsetId: 5, serialNo: 'KMRL-2024-005' },
          { trainsetId: 8, serialNo: 'KMRL-2023-008' },
          { trainsetId: 7, serialNo: 'KMRL-2024-007' },
          { trainsetId: 9, serialNo: 'KMRL-2024-009' }
        ]
        setTrainsets(mockTrainsets)
      }
    } catch (error) {
      console.error('Error fetching simulation data:', error)
      // Fallback mock data
      const mockTrainsets: Trainset[] = [
        { trainsetId: 1, serialNo: 'KMRL-2024-001' },
        { trainsetId: 2, serialNo: 'KMRL-2024-002' },
        { trainsetId: 3, serialNo: 'KMRL-2024-003' },
        { trainsetId: 4, serialNo: 'KMRL-2024-004' },
        { trainsetId: 5, serialNo: 'KMRL-2024-005' }
      ]
      setTrainsets(mockTrainsets)
    } finally {
      setLoading(false)
    }
  }

  const handleRunSimulation = async (config: any) => {
    console.log('Running simulation with config:', config)
    setIsRunning(true)
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock simulation results based on configuration
      const branding = config.branding?.enabled ? 2 : 0
      const depot = config.depot?.enabled ? 3 : 0
      const maintenance = config.maintenance?.enabled ? 4 : 0
      const demand = config.demand?.enabled ? 2 : 0
      
      const totalChanges = branding + depot + maintenance + demand
    
    const mockResults: SimulationResults = {
      changes: [
        {
          trainsetId: 101,
          serialNo: 'KMR-101',
          originalDecision: 'Service',
          newDecision: 'Maintenance',
          changeReason: 'Scheduled maintenance due to configuration parameters',
          impact: 'High' as const
        },
        {
          trainsetId: 102,
          serialNo: 'KMR-102',
          originalDecision: 'Standby',
          newDecision: 'Service',
          changeReason: 'Promoted to service due to demand optimization',
          impact: 'Medium' as const
        },
        {
          trainsetId: 103,
          serialNo: 'KMR-103',
          originalDecision: 'Service',
          newDecision: 'Standby',
          changeReason: 'Depot capacity optimization',
          impact: 'Low' as const
        }
      ],
      summary: {
        affectedTrainsets: totalChanges,
        serviceChanges: Math.ceil(totalChanges / 3),
        standbyChanges: Math.ceil(totalChanges / 4),
        maintenanceChanges: Math.ceil(totalChanges / 5),
        efficiencyGain: 12,
        costSavings: 45
      },
      metrics: {
        beforeOptimization: {
          service: 12,
          standby: 8,
          maintenance: 5
        },
        afterOptimization: {
          service: 14,
          standby: 6,
          maintenance: 5
        }
      }
    }
    
      setSimulationResults(mockResults)
      setLastSimulation(new Date())
    } finally {
      setIsRunning(false)
    }
  }

  const clearSimulation = () => {
    setSimulationResults(undefined)
    setLastSimulation(undefined)
  }

  if (loading) {
    return (
      <MainLayout alertCount={5}>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading simulation panel...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout alertCount={5}>
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Simulation Panel</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Run what-if scenarios to analyze the impact of different constraints on induction planning
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {lastSimulation && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last simulation: {lastSimulation.toLocaleTimeString()}
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={fetchSimulationData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Simulation Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Simulation Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Available Scenarios</h4>
                <div className="space-y-1">
                  <Badge variant="outline" className="block w-fit">Fitness Certificate Expired</Badge>
                  <Badge variant="outline" className="block w-fit">Branding Priority Changes</Badge>
                  <Badge variant="outline" className="block w-fit">Urgent Maintenance</Badge>
                  <Badge variant="outline" className="block w-fit">Depot Constraints</Badge>
                  <Badge variant="outline" className="block w-fit">Cleaning Delays</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Impact Analysis</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Decision changes</li>
                  <li>• Schedule adjustments</li>
                  <li>• Resource reallocation</li>
                  <li>• SLA impact assessment</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Simulation Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Real-time constraint modeling</li>
                  <li>• Multiple scenario testing</li>
                  <li>• Impact visualization</li>
                  <li>• Decision reasoning</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Use Cases</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Emergency planning</li>
                  <li>• Capacity optimization</li>
                  <li>• Risk assessment</li>
                  <li>• Strategic planning</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simulation Results Summary (if available) */}
        {simulationResults && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Affected Trainsets</p>
                    <p className="text-2xl font-bold text-gray-900">{simulationResults.summary.affectedTrainsets}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Zap className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Service Changes</p>
                    <p className="text-2xl font-bold text-green-600">{simulationResults.summary.serviceChanges}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Standby Changes</p>
                    <p className="text-2xl font-bold text-blue-600">{simulationResults.summary.standbyChanges}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Settings className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Maintenance Changes</p>
                    <p className="text-2xl font-bold text-yellow-600">{simulationResults.summary.maintenanceChanges}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Simulation Panel */}
        <EnhancedSimulation
          results={simulationResults}
          isRunning={isRunning}
          onRunSimulation={handleRunSimulation}
          onResetSimulation={clearSimulation}
          lastRun={lastSimulation}
        />
      </div>
    </MainLayout>
  )
}
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

interface SimulationConfig {
  branding: {
    enabled: boolean
    exposureLimit: number
  }
  depot: {
    enabled: boolean
    capacityLimit: number
  }
  maintenance: {
    enabled: boolean
    intervalDays: number
  }
  demand: {
    enabled: boolean
    peakHourMultiplier: number
  }
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

interface EnhancedSimulationProps {
  results?: SimulationResults
  isRunning?: boolean
  onRunSimulation: (config: SimulationConfig) => void
  onResetSimulation: () => void
  lastRun?: Date
}

export function EnhancedSimulation({ 
  results, 
  isRunning = false, 
  onRunSimulation, 
  onResetSimulation,
  lastRun 
}: EnhancedSimulationProps) {
  const [config, setConfig] = useState<SimulationConfig>({
    branding: {
      enabled: true,
      exposureLimit: 72
    },
    depot: {
      enabled: true,
      capacityLimit: 85
    },
    maintenance: {
      enabled: true,
      intervalDays: 14
    },
    demand: {
      enabled: true,
      peakHourMultiplier: 1.5
    }
  })

  const [currentView, setCurrentView] = useState<"config" | "results">("config")

  const updateConfig = (section: keyof SimulationConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const runSimulation = () => {
    onRunSimulation(config)
    setCurrentView("results")
  }

  // Chart data
  const beforeAfterData = results ? [
    {
      name: 'Before',
      Service: results.metrics.beforeOptimization.service,
      Standby: results.metrics.beforeOptimization.standby,
      Maintenance: results.metrics.beforeOptimization.maintenance
    },
    {
      name: 'After',
      Service: results.metrics.afterOptimization.service,
      Standby: results.metrics.afterOptimization.standby,
      Maintenance: results.metrics.afterOptimization.maintenance
    }
  ] : []

  const impactData = results ? [
    { name: 'High Impact', value: results.changes.filter(c => c.impact === 'High').length },
    { name: 'Medium Impact', value: results.changes.filter(c => c.impact === 'Medium').length },
    { name: 'Low Impact', value: results.changes.filter(c => c.impact === 'Low').length }
  ] : []

  const COLORS = ['#ef4444', '#f59e0b', '#10b981']

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <span>Simulation Control Panel</span>
              {lastRun && (
                <Badge variant="outline" className="ml-2">
                  Last run: {lastRun.toLocaleTimeString()}
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onResetSimulation}
                disabled={isRunning}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              
              <Button 
                onClick={runSimulation}
                disabled={isRunning}
                className="flex items-center space-x-2"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Run Simulation</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="results" disabled={!results}>Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="config" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Branding Configuration */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Branding Exposure Control</Label>
                        <Switch 
                          checked={config.branding.enabled}
                          onCheckedChange={(checked) => updateConfig('branding', 'enabled', checked)}
                        />
                      </div>
                      
                      {config.branding.enabled && (
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500">
                            Exposure Limit: {config.branding.exposureLimit}%
                          </Label>
                          <Slider
                            value={[config.branding.exposureLimit]}
                            onValueChange={([value]) => updateConfig('branding', 'exposureLimit', value)}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Depot Configuration */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Depot Capacity Management</Label>
                        <Switch 
                          checked={config.depot.enabled}
                          onCheckedChange={(checked) => updateConfig('depot', 'enabled', checked)}
                        />
                      </div>
                      
                      {config.depot.enabled && (
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500">
                            Capacity Limit: {config.depot.capacityLimit}%
                          </Label>
                          <Slider
                            value={[config.depot.capacityLimit]}
                            onValueChange={([value]) => updateConfig('depot', 'capacityLimit', value)}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Maintenance Configuration */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Maintenance Scheduling</Label>
                        <Switch 
                          checked={config.maintenance.enabled}
                          onCheckedChange={(checked) => updateConfig('maintenance', 'enabled', checked)}
                        />
                      </div>
                      
                      {config.maintenance.enabled && (
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500">
                            Interval: {config.maintenance.intervalDays} days
                          </Label>
                          <Slider
                            value={[config.maintenance.intervalDays]}
                            onValueChange={([value]) => updateConfig('maintenance', 'intervalDays', value)}
                            min={7}
                            max={30}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Demand Configuration */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Peak Hour Demand</Label>
                        <Switch 
                          checked={config.demand.enabled}
                          onCheckedChange={(checked) => updateConfig('demand', 'enabled', checked)}
                        />
                      </div>
                      
                      {config.demand.enabled && (
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500">
                            Peak Multiplier: {config.demand.peakHourMultiplier.toFixed(1)}x
                          </Label>
                          <Slider
                            value={[config.demand.peakHourMultiplier]}
                            onValueChange={([value]) => updateConfig('demand', 'peakHourMultiplier', value)}
                            min={1.0}
                            max={3.0}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="mt-4">
              {results && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-500">Efficiency Gain</p>
                            <p className="text-lg font-bold text-green-600">+{results.summary.efficiencyGain}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-500">Cost Savings</p>
                            <p className="text-lg font-bold text-blue-600">₹{results.summary.costSavings}L</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="text-xs text-gray-500">Affected Trainsets</p>
                            <p className="text-lg font-bold text-orange-600">{results.summary.affectedTrainsets}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-500">Total Changes</p>
                            <p className="text-lg font-bold text-purple-600">{results.changes.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Before vs After Optimization</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={beforeAfterData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="Service" fill="#10b981" />
                            <Bar dataKey="Standby" fill="#3b82f6" />
                            <Bar dataKey="Maintenance" fill="#f59e0b" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Change Impact Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={impactData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label
                            >
                              {impactData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Changes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Detailed Changes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.changes.slice(0, 10).map((change, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-sm">{change.serialNo}</span>
                              <span className="text-xs text-gray-500">→</span>
                              <Badge variant="outline" className="text-xs">
                                {change.originalDecision} → {change.newDecision}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${getImpactColor(change.impact)}`}>
                                {change.impact} Impact
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 max-w-md truncate">
                              {change.changeReason}
                            </p>
                          </div>
                        ))}
                        
                        {results.changes.length > 10 && (
                          <div className="text-center pt-2">
                            <p className="text-sm text-gray-500">
                              +{results.changes.length - 10} more changes
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
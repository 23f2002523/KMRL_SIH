"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PlayCircle, RotateCcw, Settings, TrendingUp } from "lucide-react"

interface SimulationScenario {
  id: string
  label: string
  description: string
  checked: boolean
}

interface SimulationChange {
  trainsetId: number
  serialNo: string
  originalDecision: string
  newDecision: string
  changeReason: string
}

interface SimulationPanelProps {
  trainsets: Array<{ trainsetId: number; serialNo: string }>
  onRunSimulation: (trainsetId: number, scenarios: string[]) => void
  simulationResults?: {
    changes: SimulationChange[]
    summary: {
      affectedTrainsets: number
      serviceChanges: number
      standbyChanges: number
      maintenanceChanges: number
    }
  }
  isRunning?: boolean
}

export function SimulationPanel({ 
  trainsets, 
  onRunSimulation, 
  simulationResults, 
  isRunning = false 
}: SimulationPanelProps) {
  const [selectedTrainset, setSelectedTrainset] = useState<string>("")
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([
    {
      id: "fitness_expired",
      label: "Fitness Certificate Expired",
      description: "Assume one or more fitness certificates have expired",
      checked: false,
    },
    {
      id: "branding_priority",
      label: "High Branding Priority",
      description: "Branding campaign requires immediate attention",
      checked: false,
    },
    {
      id: "maintenance_urgent",
      label: "Urgent Maintenance Required", 
      description: "Critical maintenance issue discovered",
      checked: false,
    },
    {
      id: "depot_constraint",
      label: "Depot Space Constraint",
      description: "Limited bay availability affects positioning",
      checked: false,
    },
    {
      id: "cleaning_delay",
      label: "Cleaning Schedule Delay",
      description: "Cleaning operations running behind schedule",
      checked: false,
    },
  ])

  const handleScenarioChange = (scenarioId: string, checked: boolean) => {
    setScenarios(prev => 
      prev.map(scenario => 
        scenario.id === scenarioId ? { ...scenario, checked } : scenario
      )
    )
  }

  const runSimulation = () => {
    if (!selectedTrainset) return
    
    const activeScenarios = scenarios
      .filter(s => s.checked)
      .map(s => s.id)
    
    onRunSimulation(parseInt(selectedTrainset), activeScenarios)
  }

  const resetSimulation = () => {
    setSelectedTrainset("")
    setScenarios(prev => prev.map(s => ({ ...s, checked: false })))
  }

  const hasActiveScenarios = scenarios.some(s => s.checked)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-purple-600" />
          <span>Simulation Panel</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Trainset Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Select Trainset
          </label>
          <Select value={selectedTrainset} onValueChange={setSelectedTrainset}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a trainset to simulate..." />
            </SelectTrigger>
            <SelectContent>
              {trainsets.map((trainset) => (
                <SelectItem key={trainset.trainsetId} value={trainset.trainsetId.toString()}>
                  {trainset.serialNo} (#{trainset.trainsetId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Scenario Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Simulation Scenarios
          </label>
          <div className="space-y-3">
            {scenarios.map((scenario) => (
              <div key={scenario.id} className="flex items-start space-x-3">
                <Checkbox
                  id={scenario.id}
                  checked={scenario.checked}
                  onCheckedChange={(checked) => 
                    handleScenarioChange(scenario.id, checked as boolean)
                  }
                />
                <div className="flex-1">
                  <label 
                    htmlFor={scenario.id}
                    className="text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    {scenario.label}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    {scenario.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={runSimulation}
            disabled={!selectedTrainset || !hasActiveScenarios || isRunning}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Run Simulation
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={resetSimulation}
            disabled={isRunning}
          >
            Reset
          </Button>
        </div>

        {/* Simulation Results */}
        {simulationResults && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-gray-900">Simulation Results</h4>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {simulationResults.summary.affectedTrainsets}
                  </div>
                  <div className="text-xs text-blue-700">Affected Trainsets</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {simulationResults.summary.serviceChanges + 
                     simulationResults.summary.standbyChanges + 
                     simulationResults.summary.maintenanceChanges}
                  </div>
                  <div className="text-xs text-blue-700">Total Changes</div>
                </div>
              </div>

              {/* Changes */}
              {simulationResults.changes.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Plan Changes</h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {simulationResults.changes.map((change, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{change.serialNo}</span>
                          <span className="text-xs text-gray-500">→</span>
                          <Badge variant="outline" className="text-xs">
                            {change.originalDecision} → {change.newDecision}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {simulationResults.changes.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No changes detected in simulation</p>
                  <p className="text-xs">Current plan remains optimal</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
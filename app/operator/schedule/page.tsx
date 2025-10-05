"use client"

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { TranslatedText } from '@/components/translation/translated-text'
import { RoleGuard } from '@/hooks/use-role-access'
import { OperatorSidebar } from '@/components/operator/operator-sidebar'
import { OperatorHeader } from '@/components/operator/operator-header'
import { AnimatedBackground } from '@/components/animated-background'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Play, 
  RotateCcw, 
  Settings, 
  Users, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Train,
  Wrench
} from 'lucide-react'

interface SimulationConstraint {
  id: string
  type: 'staff' | 'priority' | 'failure' | 'resource' | 'policy'
  description: string
  value: string | number
  impact: 'positive' | 'negative' | 'neutral'
}

interface InductionPlan {
  trainId: string
  trainName: string
  priority: number
  confidence: number
  readyTime: string
  factors: {
    fitness: number
    jobCard: number
    branding: number
    mileage: number  
    cleaning: number
    stabling: number
  }
  reason: string
  estimatedDelay?: string
}

export default function OperatorSchedulePage() {
  const { user } = useAuth()
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  
  const [constraints, setConstraints] = useState<SimulationConstraint[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResults, setSimulationResults] = useState<{
    original: InductionPlan[]
    modified: InductionPlan[]
  } | null>(null)

  // Form states for adding constraints
  const [newConstraintType, setNewConstraintType] = useState<SimulationConstraint['type']>('staff')
  const [staffCount, setStaffCount] = useState([8])
  const [brandingWeight, setBrandingWeight] = useState([25])
  const [failureTrainId, setFailureTrainId] = useState('')
  const [customConstraint, setCustomConstraint] = useState('')

  // Original baseline plan
  const originalPlan: InductionPlan[] = [
    {
      trainId: 'T-101',
      trainName: 'Metro Express A',
      priority: 1,
      confidence: 96,
      readyTime: '19:30',
      factors: { fitness: 95, jobCard: 92, branding: 88, mileage: 90, cleaning: 85, stabling: 94 },
      reason: 'High fitness score, optimal mileage balance'
    },
    {
      trainId: 'T-104',
      trainName: 'City Link 1',
      priority: 2,
      confidence: 89,
      readyTime: '20:15',
      factors: { fitness: 88, jobCard: 90, branding: 92, mileage: 85, cleaning: 80, stabling: 87 },
      reason: 'Strong branding compliance, good job-card status'
    },
    {
      trainId: 'T-107',
      trainName: 'Metro Connect B',
      priority: 3,
      confidence: 82,
      readyTime: '21:00',
      factors: { fitness: 82, jobCard: 85, branding: 78, mileage: 88, cleaning: 90, stabling: 80 },
      reason: 'Balanced across factors, cleaning priority'
    },
    {
      trainId: 'T-110',
      trainName: 'Express Route 2',
      priority: 4,
      confidence: 76,
      readyTime: '21:45',
      factors: { fitness: 75, jobCard: 78, branding: 85, mileage: 82, cleaning: 75, stabling: 85 },
      reason: 'Adequate performance, moderate priority'
    },
    {
      trainId: 'T-115',
      trainName: 'Metro Link C',
      priority: 5,
      confidence: 71,
      readyTime: '22:30',
      factors: { fitness: 70, jobCard: 72, branding: 88, mileage: 78, cleaning: 68, stabling: 82 },
      reason: 'Lower fitness but strong branding'
    }
  ]

  const addConstraint = () => {
    let newConstraint: SimulationConstraint

    switch (newConstraintType) {
      case 'staff':
        newConstraint = {
          id: Date.now().toString(),
          type: 'staff',
          description: `Add ${staffCount[0] - 8} extra staff in cleaning`,
          value: staffCount[0],
          impact: staffCount[0] > 8 ? 'positive' : 'negative'
        }
        break
      case 'priority':
        newConstraint = {
          id: Date.now().toString(),
          type: 'priority',
          description: `Reduce branding priority weight to ${brandingWeight[0]}%`,
          value: brandingWeight[0],
          impact: brandingWeight[0] < 25 ? 'negative' : 'neutral'
        }
        break
      case 'failure':
        newConstraint = {
          id: Date.now().toString(),
          type: 'failure',
          description: `What if ${failureTrainId} fails inspection tonight?`,
          value: failureTrainId,
          impact: 'negative'
        }
        break
      default:
        newConstraint = {
          id: Date.now().toString(),
          type: 'policy',
          description: customConstraint,
          value: customConstraint,
          impact: 'neutral'
        }
    }

    setConstraints([...constraints, newConstraint])
    resetForm()
  }

  const resetForm = () => {
    setStaffCount([8])
    setBrandingWeight([25])
    setFailureTrainId('')
    setCustomConstraint('')
  }

  const removeConstraint = (id: string) => {
    setConstraints(constraints.filter(c => c.id !== id))
  }

  const runSimulation = async () => {
    setIsSimulating(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate modified plan based on constraints
    let modifiedPlan = [...originalPlan]
    
    constraints.forEach(constraint => {
      switch (constraint.type) {
        case 'staff':
          if (constraint.value as number > 8) {
            // More cleaning staff improves cleaning scores
            modifiedPlan = modifiedPlan.map(plan => ({
              ...plan,
              factors: { ...plan.factors, cleaning: Math.min(100, plan.factors.cleaning + 10) },
              confidence: Math.min(100, plan.confidence + 3),
              readyTime: plan.readyTime // Earlier ready time due to faster cleaning
            }))
          }
          break
        case 'priority':
          if (constraint.value as number < 25) {
            // Reduced branding weight changes priorities
            modifiedPlan = modifiedPlan.map(plan => ({
              ...plan,
              factors: { ...plan.factors, branding: plan.factors.branding * (constraint.value as number / 25) },
              confidence: plan.confidence - 2
            }))
          }
          break
        case 'failure':
          const trainId = constraint.value as string
          const failedTrainIndex = modifiedPlan.findIndex(p => p.trainId === trainId)
          if (failedTrainIndex !== -1) {
            modifiedPlan[failedTrainIndex] = {
              ...modifiedPlan[failedTrainIndex],
              priority: 999,
              confidence: 0,
              readyTime: 'FAILED',
              factors: { fitness: 0, jobCard: 0, branding: 0, mileage: 0, cleaning: 0, stabling: 0 },
              reason: 'Failed inspection - removed from service',
              estimatedDelay: '24-48 hours'
            }
          }
          break
      }
    })
    
    // Re-sort by priority (excluding failed trains)
    const workingTrains = modifiedPlan.filter(p => p.confidence > 0)
    const failedTrains = modifiedPlan.filter(p => p.confidence === 0)
    
    workingTrains.sort((a, b) => {
      const aScore = Object.values(a.factors).reduce((sum, val) => sum + val, 0) / 6
      const bScore = Object.values(b.factors).reduce((sum, val) => sum + val, 0) / 6
      return bScore - aScore
    })
    
    // Reassign priorities
    workingTrains.forEach((train, index) => {
      train.priority = index + 1
    })
    
    modifiedPlan = [...workingTrains, ...failedTrains]
    
    setSimulationResults({
      original: originalPlan,
      modified: modifiedPlan
    })
    setIsSimulating(false)
  }

  const resetSimulation = () => {
    setConstraints([])
    setSimulationResults(null)
  }

  const getConstraintIcon = (type: SimulationConstraint['type']) => {
    switch (type) {
      case 'staff': return <Users className="h-4 w-4" />
      case 'priority': return <TrendingUp className="h-4 w-4" />
      case 'failure': return <AlertTriangle className="h-4 w-4" />
      case 'resource': return <Wrench className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getImpactColor = (impact: SimulationConstraint['impact']) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200'
      case 'negative': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  return (
    <RoleGuard role="Operator">
      <div className="h-screen relative flex">
        <AnimatedBackground />
        <div className="relative z-10 w-full flex">
        <OperatorSidebar onSidebarChange={setIsSidebarExpanded} />
        
        <div 
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarExpanded ? 'lg:pl-64' : 'lg:pl-16'
          }`}
        >
          <OperatorHeader user={user} isSidebarExpanded={isSidebarExpanded} />
          
          <main className="flex-1 overflow-auto pt-20 p-6 space-y-6">
            <div className="bg-card text-card-foreground overflow-hidden shadow rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
                    <Play className="h-8 w-8 text-primary" />
                    <TranslatedText text="Schedule Simulation" />
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    <TranslatedText text="Optimize train schedules with real-time constraints and AI-powered simulation" />
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetSimulation}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset All
                  </Button>
                  <Button 
                    onClick={runSimulation} 
                  disabled={constraints.length === 0 || isSimulating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSimulating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Simulating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Simulation
                    </>
                  )}
                </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Constraint Builder */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Set Constraints
                    </CardTitle>
                    <CardDescription>
                      Add operational constraints to test scenarios
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Constraint Type</Label>
                      <Select value={newConstraintType} onValueChange={(value: SimulationConstraint['type']) => setNewConstraintType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staff">Staff Adjustment</SelectItem>
                          <SelectItem value="priority">Priority Weight</SelectItem>
                          <SelectItem value="failure">Train Failure</SelectItem>
                          <SelectItem value="policy">Custom Policy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newConstraintType === 'staff' && (
                      <div>
                        <Label>Cleaning Staff Count: {staffCount[0]}</Label>
                        <Slider
                          value={staffCount}
                          onValueChange={setStaffCount}
                          max={15}
                          min={4}
                          step={1}
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Current: 8 staff, Adjust: +{staffCount[0] - 8} extra
                        </p>
                      </div>
                    )}

                    {newConstraintType === 'priority' && (
                      <div>
                        <Label>Branding Priority Weight: {brandingWeight[0]}%</Label>
                        <Slider
                          value={brandingWeight}
                          onValueChange={setBrandingWeight}
                          max={50}
                          min={5}
                          step={5}
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Default: 25%, Current: {brandingWeight[0]}%
                        </p>
                      </div>
                    )}

                    {newConstraintType === 'failure' && (
                      <div>
                        <Label>Train ID for Failure Test</Label>
                        <Select value={failureTrainId} onValueChange={setFailureTrainId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select train..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="T-101">T-101 (Metro Express A)</SelectItem>
                            <SelectItem value="T-104">T-104 (City Link 1)</SelectItem>
                            <SelectItem value="T-107">T-107 (Metro Connect B)</SelectItem>
                            <SelectItem value="T-110">T-110 (Express Route 2)</SelectItem>
                            <SelectItem value="T-115">T-115 (Metro Link C)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {newConstraintType === 'policy' && (
                      <div>
                        <Label>Custom Constraint</Label>
                        <Textarea
                          value={customConstraint}
                          onChange={(e) => setCustomConstraint(e.target.value)}
                          placeholder="Describe your what-if scenario..."
                          className="mt-1"
                        />
                      </div>
                    )}

                    <Button 
                      onClick={addConstraint} 
                      className="w-full"
                      disabled={
                        (newConstraintType === 'failure' && !failureTrainId) ||
                        (newConstraintType === 'policy' && !customConstraint.trim())
                      }
                    >
                      Add Constraint
                    </Button>

                    {/* Active Constraints */}
                    {constraints.length > 0 && (
                      <div className="space-y-2">
                        <Label>Active Constraints ({constraints.length})</Label>
                        {constraints.map((constraint) => (
                          <div key={constraint.id} className={`p-3 rounded-lg border ${getImpactColor(constraint.impact)}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-2">
                                {getConstraintIcon(constraint.type)}
                                <span className="text-sm font-medium">{constraint.description}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeConstraint(constraint.id)}
                                className="h-6 w-6 p-0"
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Results Comparison */}
              <div className="lg:col-span-2">
                {simulationResults ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ArrowRight className="h-5 w-5 text-green-600" />
                          Simulation Results: Side-by-Side Comparison
                        </CardTitle>
                        <CardDescription>
                          Original plan vs Modified plan with your constraints
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Original Plan */}
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Original Plan
                            </h3>
                            <div className="space-y-3">
                              {simulationResults.original.map((train, index) => (
                                <div key={train.trainId} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        #{train.priority}
                                      </Badge>
                                      <span className="font-medium">{train.trainId}</span>
                                      <span className="text-sm text-gray-600">{train.trainName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                                        {train.confidence}% confident
                                      </Badge>
                                      <span className="text-sm font-medium">{train.readyTime}</span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-600">{train.reason}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Modified Plan */}
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Zap className="h-4 w-4 text-green-600" />
                              Modified Plan (With Constraints)
                            </h3>
                            <div className="space-y-3">
                              {simulationResults.modified.map((train, index) => (
                                <div key={train.trainId} className={`rounded-lg p-3 ${
                                  train.confidence === 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                                }`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant={train.confidence === 0 ? "destructive" : "outline"} className="text-xs">
                                        #{train.priority === 999 ? 'FAIL' : train.priority}
                                      </Badge>
                                      <span className="font-medium">{train.trainId}</span>
                                      <span className="text-sm text-gray-600">{train.trainName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {train.confidence === 0 ? (
                                        <Badge variant="destructive">FAILED</Badge>
                                      ) : (
                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                          {train.confidence}% confident
                                        </Badge>
                                      )}
                                      <span className="text-sm font-medium">{train.readyTime}</span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-600">{train.reason}</p>
                                  {train.estimatedDelay && (
                                    <p className="text-xs text-red-600 mt-1">Estimated delay: {train.estimatedDelay}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Impact Summary */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Impact Summary</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            {constraints.map((constraint, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3" />
                                {constraint.description} applied successfully
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Ready to Simulate</h3>
                      <p className="text-muted-foreground mb-4">
                        Add constraints on the left and click "Run Simulation" to see the impact on tonight's induction plan
                      </p>
                      <div className="text-sm text-gray-500">
                        Try examples like:
                        <ul className="mt-2 space-y-1">
                          <li>• Add 2 extra staff in cleaning</li>
                          <li>• Reduce branding priority weight to 10%</li>
                          <li>• What if T-110 fails inspection tonight?</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </main>
        </div>
        </div>
      </div>
    </RoleGuard>
  )
}
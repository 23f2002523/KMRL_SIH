"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Zap, Download, RefreshCw, CheckCircle, Clock, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

interface InductionPlanData {
  rank: number
  trainsetId: number
  serialNo: string
  decision: "Service" | "Standby" | "Maintenance"
  reason: string
  priority: "High" | "Medium" | "Low"
  estimatedReadyTime?: string
}

interface InductionPlanSectionProps {
  plans: InductionPlanData[]
  isGenerating?: boolean
  onGeneratePlan: () => void
  onExportPlan: () => void
  lastGenerated?: Date
}

function getDecisionBadge(decision: "Service" | "Standby" | "Maintenance") {
  const decisionConfig = {
    Service: { 
      color: "bg-green-100 text-green-800", 
      icon: <CheckCircle className="h-3 w-3" />,
      text: "Service"
    },
    Standby: { 
      color: "bg-yellow-100 text-yellow-800", 
      icon: <Clock className="h-3 w-3" />,
      text: "Standby"
    },
    Maintenance: { 
      color: "bg-red-100 text-red-800", 
      icon: <Wrench className="h-3 w-3" />,
      text: "Maintenance"
    },
  }
  
  const config = decisionConfig[decision]
  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      {config.icon}
      {config.text}
    </Badge>
  )
}

function getPriorityBadge(priority: "High" | "Medium" | "Low") {
  const priorityConfig = {
    High: "bg-red-100 text-red-800 border-red-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
    Low: "bg-green-100 text-green-800 border-green-200",
  }
  
  return (
    <Badge variant="outline" className={priorityConfig[priority]}>
      {priority}
    </Badge>
  )
}

export function InductionPlanSection({ 
  plans, 
  isGenerating = false, 
  onGeneratePlan, 
  onExportPlan,
  lastGenerated 
}: InductionPlanSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span>Induction Plan</span>
            {lastGenerated && (
              <span className="text-sm text-gray-500 font-normal">
                (Generated: {lastGenerated.toLocaleTimeString()})
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExportPlan}
              disabled={plans.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={onGeneratePlan}
              disabled={isGenerating}
              size="sm"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Plan
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {plans.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Induction Plan Generated</h3>
            <p className="text-gray-500 mb-4">
              Click "Generate Plan" to create an optimized induction plan for today
            </p>
            <Button onClick={onGeneratePlan} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Induction Plan
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {plans.filter(p => p.decision === "Service").length}
                </div>
                <div className="text-sm text-gray-600">For Service</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {plans.filter(p => p.decision === "Standby").length}
                </div>
                <div className="text-sm text-gray-600">Standby</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {plans.filter(p => p.decision === "Maintenance").length}
                </div>
                <div className="text-sm text-gray-600">Maintenance</div>
              </div>
            </div>

            {/* Plan Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Trainset</TableHead>
                    <TableHead>Decision</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Ready Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow 
                      key={plan.trainsetId}
                      className={cn(
                        "hover:bg-gray-50",
                        plan.rank <= 3 && "bg-blue-50" // Highlight top 3
                      )}
                    >
                      {/* Rank */}
                      <TableCell>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                          plan.rank === 1 ? "bg-yellow-100 text-yellow-800" :
                          plan.rank <= 3 ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-600"
                        )}>
                          {plan.rank}
                        </div>
                      </TableCell>

                      {/* Trainset */}
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">
                              {plan.serialNo}
                            </span>
                          </div>
                          <span className="font-medium">#{plan.trainsetId}</span>
                        </div>
                      </TableCell>

                      {/* Decision */}
                      <TableCell>
                        {getDecisionBadge(plan.decision)}
                      </TableCell>

                      {/* Priority */}
                      <TableCell>
                        {getPriorityBadge(plan.priority)}
                      </TableCell>

                      {/* Reason */}
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-gray-700 truncate" title={plan.reason}>
                          {plan.reason}
                        </p>
                      </TableCell>

                      {/* Ready Time */}
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {plan.estimatedReadyTime || "Immediate"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
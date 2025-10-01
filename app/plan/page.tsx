"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { EnhancedInductionPlan } from "@/components/train/enhanced-induction-plan"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react"
import { DocumentInductionService } from "@/lib/document-induction-service"
import { useLanguage } from "@/hooks/use-language"

interface InductionPlan {
  rank: number
  trainsetId: number
  serialNo: string
  decision: "Service" | "Standby" | "Maintenance"
  reason: string
  priority: "High" | "Medium" | "Low"
  estimatedReadyTime?: string
  confidence?: number
}

export default function PlanPage() {
  const { t } = useLanguage()
  const [inductionPlans, setInductionPlans] = useState<InductionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastGenerated, setLastGenerated] = useState<Date | undefined>()

  useEffect(() => {
    fetchPlanData()
  }, [])

  const fetchPlanData = async () => {
    setLoading(true)
    try {
      // In a real app, this would fetch from an API
      // For now, using mock data based on trainsets
      const decisions: ("Service" | "Standby" | "Maintenance")[] = ["Service", "Standby", "Maintenance"]
      const priorities: ("High" | "Medium" | "Low")[] = ["High", "Medium", "Low"]
      const reasons = [
        "Fitness certificate valid, optimal performance metrics",
        "Strategic reserve for peak hour demand coverage", 
        "Scheduled preventive maintenance - brake system check required",
        "Branding exposure limit reached - 72% threshold exceeded",
        "Depot capacity optimization - balanced distribution required",
        "High-priority route assignment - morning rush coverage",
        "Maintenance window available - non-critical repairs scheduled",
        "Standby rotation policy - ensuring fleet readiness"
      ]
      
      const serialNumbers = [
        "KMRL-2024-001", "KMRL-2024-002", "KMRL-2024-003", "KMRL-2024-004",
        "KMRL-2024-005", "KMRL-2023-008", "KMRL-2024-007", "KMRL-2024-009"
      ]
      
      const mockPlans: InductionPlan[] = await Promise.all(
        serialNumbers.map(async (serialNo, index) => {
          const baseDecision = decisions[index % 3]
          const trainsetId = index + 1
          
          // Get document-enhanced decision for high priority plans
          const priority = priorities[index % 3]
          let enhancedDecision = baseDecision
          let confidence = 0.7
          
          if (priority === 'High') {
            try {
              const enhancement = await DocumentInductionService.enhanceInductionDecision(
                trainsetId, 
                serialNo, 
                baseDecision
              )
              enhancedDecision = enhancement.decision as "Service" | "Standby" | "Maintenance"
              confidence = enhancement.confidence
            } catch (error) {
              console.error('Error enhancing decision with documents:', error)
            }
          }
          
          return {
            rank: index + 1,
            trainsetId,
            serialNo,
            decision: enhancedDecision as "Service" | "Standby" | "Maintenance",
            reason: reasons[index],
            priority,
            estimatedReadyTime: index < 5 ? `${14 + (index % 4)}:${index % 2 === 0 ? '00' : '30'}` : undefined,
            confidence
          }
        })
      )
      
      setInductionPlans(mockPlans)
      setLastGenerated(new Date())
    } catch (error) {
      console.error('Error fetching plan data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePlan = async () => {
    setIsGenerating(true)
    try {
      // Simulate API call to generate new plan
      await new Promise(resolve => setTimeout(resolve, 2000))
      await fetchPlanData()
      setLastGenerated(new Date())
    } finally {
      setIsGenerating(false)
    }
  }

  const planStats = {
    total: inductionPlans.length,
    service: inductionPlans.filter(p => p.decision === 'Service').length,
    standby: inductionPlans.filter(p => p.decision === 'Standby').length,
    maintenance: inductionPlans.filter(p => p.decision === 'Maintenance').length,
    highPriority: inductionPlans.filter(p => p.priority === 'High').length
  }

  if (loading) {
    return (
      <MainLayout alertCount={5}>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">{t('dashboard.loadingInductionPlan', 'Loading induction plan...')}</p>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.inductionPlan', 'Induction Plan')}</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('dashboard.aiGeneratedPlanning', 'AI-generated trainset induction and allocation planning')}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {lastGenerated && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('dashboard.lastUpdated', 'Last updated')}: {lastGenerated.toLocaleTimeString()}
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={fetchPlanData}
                disabled={loading || isGenerating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {t('common.refresh', 'Refresh')}
              </Button>
            </div>
          </div>
        </div>

        {/* Plan Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.totalPlans', 'Total Plans')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{planStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Service</p>
                  <p className="text-2xl font-bold text-green-600">{planStats.service}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Standby</p>
                  <p className="text-2xl font-bold text-blue-600">{planStats.standby}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance</p>
                  <p className="text-2xl font-bold text-yellow-600">{planStats.maintenance}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</p>
                  <p className="text-2xl font-bold text-red-600">{planStats.highPriority}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Overview Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Plan Generation Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Algorithm</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Advanced machine learning model considering fitness certificates, 
                  branding exposure, depot constraints, and operational efficiency.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Decision Factors</h4>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">Fitness Status</Badge>
                  <Badge variant="outline">Branding Limits</Badge>
                  <Badge variant="outline">Depot Capacity</Badge>
                  <Badge variant="outline">Maintenance Schedule</Badge>
                  <Badge variant="outline">Route Demand</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Optimization Goals</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Maximize operational efficiency</li>
                  <li>• Minimize SLA breach risk</li>
                  <li>• Balance depot utilization</li>
                  <li>• Optimize maintenance windows</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Induction Plan Section with Timeline */}
        <EnhancedInductionPlan 
          plans={inductionPlans}
          isGenerating={isGenerating}
          onGeneratePlan={handleGeneratePlan}
          lastGenerated={lastGenerated}
        />
      </div>
    </MainLayout>
  )
}
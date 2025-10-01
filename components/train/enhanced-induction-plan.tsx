"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Download, 
  FileText, 
  Table,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  BookOpen,
  FileCheck,
  Lightbulb
} from "lucide-react"
import { format, addHours, startOfDay } from "date-fns"
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { DocumentInductionService, type DocumentInsight } from "@/lib/document-induction-service"

interface InductionPlanData {
  rank: number
  trainsetId: number
  serialNo: string
  decision: "Service" | "Standby" | "Maintenance"
  reason: string
  priority: "High" | "Medium" | "Low"
  estimatedReadyTime?: string
  documentInsights?: DocumentInsight[]
  confidence?: number
}

interface EnhancedInductionPlanProps {
  plans: InductionPlanData[]
  isGenerating?: boolean
  onGeneratePlan: () => void
  lastGenerated?: Date
}

interface TimelineItem {
  id: number
  title: string
  startTime: Date
  endTime: Date
  status: "scheduled" | "in-progress" | "completed" | "delayed"
  priority: "High" | "Medium" | "Low"
  category: string
}

export function EnhancedInductionPlan({ 
  plans, 
  isGenerating = false, 
  onGeneratePlan, 
  lastGenerated 
}: EnhancedInductionPlanProps) {
  const [currentView, setCurrentView] = useState<"table" | "timeline" | "documents">("table")
  const [documentInsights, setDocumentInsights] = useState<Record<number, DocumentInsight[]>>({})
  const [loadingInsights, setLoadingInsights] = useState<Record<number, boolean>>({})

  // Convert plans to timeline items
  const generateTimelineItems = (): TimelineItem[] => {
    const now = new Date()
    const todayStart = startOfDay(now)
    
    return plans.map((plan, index) => {
      const startHour = 8 + (index * 2) // Stagger start times
      const duration = plan.priority === "High" ? 3 : plan.priority === "Medium" ? 2 : 1.5
      
      const startTime = addHours(todayStart, startHour)
      const endTime = addHours(startTime, duration)
      
      return {
        id: plan.trainsetId,
        title: `${plan.serialNo} - ${plan.decision}`,
        startTime,
        endTime,
        status: index < 2 ? "completed" : index < 4 ? "in-progress" : "scheduled",
        priority: plan.priority,
        category: plan.decision
      }
    })
  }

  const timelineItems = generateTimelineItems()

  // Load document insights for a trainset
  const loadDocumentInsights = async (trainsetId: number, serialNo: string) => {
    setLoadingInsights(prev => ({ ...prev, [trainsetId]: true }))
    try {
      const insights = await DocumentInductionService.getDocumentInsights(trainsetId)
      setDocumentInsights(prev => ({ ...prev, [trainsetId]: insights }))
    } catch (error) {
      console.error('Failed to load document insights:', error)
    } finally {
      setLoadingInsights(prev => ({ ...prev, [trainsetId]: false }))
    }
  }

  // Load insights for high priority plans automatically
  const loadHighPriorityInsights = async () => {
    const highPriorityPlans = plans.filter(p => p.priority === 'High').slice(0, 3)
    for (const plan of highPriorityPlans) {
      if (!documentInsights[plan.trainsetId]) {
        await loadDocumentInsights(plan.trainsetId, plan.serialNo)
      }
    }
  }

  // Auto-load insights when plans change
  useEffect(() => {
    if (plans.length > 0) {
      loadHighPriorityInsights()
    }
  }, [plans])

  const exportToPDF = async () => {
    const pdf = new jsPDF()
    
    // Title
    pdf.setFontSize(20)
    pdf.text('Induction Plan Report', 20, 30)
    
    // Date
    pdf.setFontSize(12)
    pdf.text(`Generated: ${format(new Date(), 'PPP')}`, 20, 45)
    
    // Summary
    pdf.setFontSize(14)
    pdf.text('Summary:', 20, 65)
    
    const summary = [
      `Total Plans: ${plans.length}`,
      `Service Assignments: ${plans.filter(p => p.decision === 'Service').length}`,
      `Standby Assignments: ${plans.filter(p => p.decision === 'Standby').length}`,
      `Maintenance Assignments: ${plans.filter(p => p.decision === 'Maintenance').length}`,
      `High Priority: ${plans.filter(p => p.priority === 'High').length}`,
      `Document-Enhanced Decisions: ${plans.filter(p => p.confidence && p.confidence > 0.8).length}`,
      `AI Confidence Average: ${Math.round(plans.reduce((acc, p) => acc + (p.confidence || 0.7), 0) / plans.length * 100)}%`
    ]
    
    summary.forEach((line, index) => {
      pdf.text(line, 20, 80 + (index * 10))
    })
    
    // Table headers
    pdf.setFontSize(12)
    pdf.text('Detailed Plan with Document Intelligence:', 20, 155)
    pdf.text('Rank', 20, 170)
    pdf.text('Serial No', 40, 170)
    pdf.text('Decision', 80, 170)
    pdf.text('Priority', 120, 170)
    pdf.text('AI Confidence', 160, 170)
    
    // Table data
    plans.slice(0, 15).forEach((plan, index) => {
      const yPos = 185 + (index * 10)
      pdf.text(plan.rank.toString(), 20, yPos)
      pdf.text(plan.serialNo, 40, yPos)
      pdf.text(plan.decision, 80, yPos)
      pdf.text(plan.priority, 120, yPos)
      pdf.text(`${Math.round((plan.confidence || 0.7) * 100)}%`, 160, yPos)
    })
    
    // Document insights summary
    const totalInsights = Object.values(documentInsights).flat().length
    if (totalInsights > 0) {
      pdf.setFontSize(14)
      pdf.text('Document Intelligence Summary:', 20, 185 + (Math.min(plans.length, 15) * 10) + 20)
      
      const insightsSummary = [
        `Total Document Insights: ${totalInsights}`,
        `High Impact Insights: ${Object.values(documentInsights).flat().filter(i => i.impact === 'high').length}`,
        `Trainsets with Document Analysis: ${Object.keys(documentInsights).length}`,
        `Most Common Category: ${Object.values(documentInsights).flat().reduce((acc, insight) => {
          acc[insight.category] = (acc[insight.category] || 0) + 1
          return acc
        }, {} as Record<string, number>)}`
      ]
      
      insightsSummary.slice(0, 3).forEach((line, index) => { // Only show first 3 to fit on page
        pdf.setFontSize(10)
        const yPos = 200 + (Math.min(plans.length, 15) * 10) + 20 + (index * 8)
        if (yPos < 280) { // Make sure it fits on page
          pdf.text(line, 20, yPos)
        }
      })
    }
    
    pdf.save(`induction-plan-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  const exportToExcel = () => {
    // Main induction plan worksheet
    const planWorksheet = XLSX.utils.json_to_sheet(
      plans.map(plan => ({
        'Rank': plan.rank,
        'Trainset ID': plan.trainsetId,
        'Serial Number': plan.serialNo,
        'Decision': plan.decision,
        'Priority': plan.priority,
        'AI Confidence': plan.confidence ? `${Math.round(plan.confidence * 100)}%` : 'N/A',
        'Reason': plan.reason,
        'Estimated Ready Time': plan.estimatedReadyTime || 'TBD'
      }))
    )
    
    // Document insights worksheet
    const allInsights = Object.entries(documentInsights).flatMap(([trainsetId, insights]) =>
      insights.map(insight => ({
        'Trainset ID': trainsetId,
        'Serial Number': plans.find(p => p.trainsetId === parseInt(trainsetId))?.serialNo || 'N/A',
        'Document Title': insight.title,
        'Category': insight.category,
        'Impact Level': insight.impact.toUpperCase(),
        'Insight': insight.insight
      }))
    )
    
    const insightsWorksheet = XLSX.utils.json_to_sheet(allInsights)
    
    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, planWorksheet, 'Induction Plan')
    
    if (allInsights.length > 0) {
      XLSX.utils.book_append_sheet(workbook, insightsWorksheet, 'Document Insights')
    }
    
    // Summary worksheet
    const summaryData = [
      { 'Metric': 'Total Plans', 'Value': plans.length },
      { 'Metric': 'Service Assignments', 'Value': plans.filter(p => p.decision === 'Service').length },
      { 'Metric': 'Standby Assignments', 'Value': plans.filter(p => p.decision === 'Standby').length },
      { 'Metric': 'Maintenance Assignments', 'Value': plans.filter(p => p.decision === 'Maintenance').length },
      { 'Metric': 'High Priority Plans', 'Value': plans.filter(p => p.priority === 'High').length },
      { 'Metric': 'Document-Enhanced Decisions', 'Value': plans.filter(p => p.confidence && p.confidence > 0.8).length },
      { 'Metric': 'Average AI Confidence', 'Value': `${Math.round(plans.reduce((acc, p) => acc + (p.confidence || 0.7), 0) / plans.length * 100)}%` },
      { 'Metric': 'Total Document Insights', 'Value': allInsights.length }
    ]
    
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary')
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(data, `induction-plan-with-documents-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': return 'bg-blue-500'
      case 'delayed': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'Service': return 'bg-green-100 text-green-800 border-green-200'
      case 'Standby': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>AI-Generated Induction Plan</span>
            {lastGenerated && (
              <Badge variant="outline" className="ml-2">
                Updated {format(lastGenerated, 'HH:mm')}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {/* View Toggle */}
            <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="table" className="flex items-center space-x-1">
                  <Table className="h-4 w-4" />
                  <span>Table</span>
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center space-x-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>Timeline</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Documents</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Export Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={exportToPDF}
              className="flex items-center space-x-1"
            >
              <FileText className="h-4 w-4" />
              <span>PDF</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              className="flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Excel</span>
            </Button>
            
            {/* Generate Button */}
            <Button 
              onClick={onGeneratePlan}
              disabled={isGenerating}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  <span>Generate Plan</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
          <TabsContent value="table" className="mt-0">
            {/* Traditional Table View */}
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trainset
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Decision
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ready Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {plans.map((plan) => (
                      <tr key={plan.trainsetId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                              {plan.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {plan.serialNo}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {plan.trainsetId}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant="outline" className={getDecisionColor(plan.decision)}>
                            {plan.decision}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant="outline" className={getPriorityColor(plan.priority)}>
                            {plan.priority}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {plan.estimatedReadyTime || 'TBD'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                          <div className="truncate" title={plan.reason}>
                            {plan.reason}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-0">
            {/* Timeline/Gantt View */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Timeline View</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-400 rounded"></div>
                    <span>Scheduled</span>
                  </div>
                </div>
              </div>
              
              {/* Timeline Grid */}
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                {/* Time Headers */}
                <div className="grid grid-cols-13 gap-1 mb-2 text-xs text-gray-500">
                  <div></div>
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="text-center">
                      {8 + i}:00
                    </div>
                  ))}
                </div>
                
                {/* Timeline Items */}
                <div className="space-y-2">
                  {timelineItems.map((item) => {
                    const startHour = item.startTime.getHours() - 8
                    const duration = (item.endTime.getTime() - item.startTime.getTime()) / (1000 * 60 * 60)
                    const widthCols = Math.max(1, Math.round(duration))
                    
                    return (
                      <div key={item.id} className="grid grid-cols-13 gap-1 items-center">
                        {/* Task Name */}
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.title}
                        </div>
                        
                        {/* Timeline Bar */}
                        <div className="col-span-12 relative h-8">
                          <div
                            className={`absolute h-6 rounded ${getStatusColor(item.status)} flex items-center px-2 text-white text-xs font-medium`}
                            style={{
                              left: `${(startHour / 12) * 100}%`,
                              width: `${(widthCols / 12) * 100}%`,
                              minWidth: '60px'
                            }}
                          >
                            <div className="flex items-center space-x-1">
                              {item.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                              {item.status === 'in-progress' && <Clock className="h-3 w-3" />}
                              {item.status === 'delayed' && <AlertCircle className="h-3 w-3" />}
                              <span className="truncate">
                                {format(item.startTime, 'HH:mm')} - {format(item.endTime, 'HH:mm')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-0">
            {/* Document Insights View */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Document Intelligence & Insights</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Lightbulb className="h-3 w-3" />
                    <span>AI-Powered</span>
                  </Badge>
                </div>
              </div>
              
              {/* Document Insights for High Priority Plans */}
              <div className="grid gap-4">
                {plans.filter(p => p.priority === 'High').slice(0, 5).map((plan) => (
                  <Card key={plan.trainsetId} className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-sm">{plan.serialNo}</h4>
                            <Badge variant="outline" className="text-xs">
                              {plan.decision}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                              {plan.priority} Priority
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {plan.reason}
                          </p>
                          
                          {/* Document Insights */}
                          {loadingInsights[plan.trainsetId] ? (
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                              <span>Analyzing documents...</span>
                            </div>
                          ) : documentInsights[plan.trainsetId] ? (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 mb-2">
                                <FileCheck className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Document Analysis</span>
                                <Badge variant="outline" className="text-xs">
                                  {documentInsights[plan.trainsetId].length} insights
                                </Badge>
                              </div>
                              
                              {documentInsights[plan.trainsetId].slice(0, 2).map((insight, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs ${
                                            insight.impact === 'high' 
                                              ? 'bg-red-50 text-red-600 border-red-200' 
                                              : insight.impact === 'medium'
                                              ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
                                              : 'bg-green-50 text-green-600 border-green-200'
                                          }`}
                                        >
                                          {insight.impact.toUpperCase()} Impact
                                        </Badge>
                                        <span className="text-xs text-gray-500 capitalize">
                                          {insight.category}
                                        </span>
                                      </div>
                                      <p className="text-sm font-medium mb-1">{insight.title}</p>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {insight.insight}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {documentInsights[plan.trainsetId].length > 2 && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs"
                                  onClick={() => {/* Open detailed view */}}
                                >
                                  View {documentInsights[plan.trainsetId].length - 2} more insights
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => loadDocumentInsights(plan.trainsetId, plan.serialNo)}
                              className="flex items-center space-x-1"
                            >
                              <Search className="h-3 w-3" />
                              <span>Analyze Documents</span>
                            </Button>
                          )}
                        </div>
                        
                        {plan.confidence && (
                          <div className="ml-4 text-right">
                            <div className="text-xs text-gray-500 mb-1">AI Confidence</div>
                            <div className={`text-sm font-medium ${
                              plan.confidence >= 0.8 ? 'text-green-600' :
                              plan.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {Math.round(plan.confidence * 100)}%
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Document Search & Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Document Integration Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Object.keys(documentInsights).length}
                      </div>
                      <div className="text-sm text-gray-500">Trainsets Analyzed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Object.values(documentInsights).flat().filter(i => i.impact === 'high').length}
                      </div>
                      <div className="text-sm text-gray-500">High Impact Insights</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(Object.values(documentInsights).flat().length / Math.max(Object.keys(documentInsights).length, 1) * 10) / 10}
                      </div>
                      <div className="text-sm text-gray-500">Avg. Insights per Trainset</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
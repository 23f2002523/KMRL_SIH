"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { RoleGuard } from '@/hooks/use-role-access'
import { useLanguage } from '@/hooks/use-libre-translate'
import { TranslatedText } from '@/components/translation/libre-translated-text'
import { OperatorSidebar } from '@/components/operator/operator-sidebar'
import { OperatorHeader } from '@/components/operator/operator-header'
import { AIInductionPanel } from '@/components/operator/ai-induction-panel'
import { AnimatedBackground } from '@/components/animated-background'
import { Calendar, ChevronLeft, ChevronRight, Train, CheckCircle, AlertTriangle, Settings, Pause, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OperatorDashboard() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showDatePicker && !target.closest('.date-picker-container')) {
        setShowDatePicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDatePicker])

  // Generate AI/ML predictions for next 15 days
  const generatePredictions = (date: Date) => {
    const today = new Date()
    const dayDiff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    // Base values for today
    const baseStats = {
      totalTrainsets: 57,
      readyForService: 34,
      standby: 15,
      inMaintenance: 8,
      alerts: 12
    }

    // AI prediction algorithm - simulate realistic variations
    const variance = Math.sin(dayDiff * 0.3) * 0.1 + Math.random() * 0.05
    const maintenanceCycle = Math.floor(dayDiff / 7) % 3 // Weekly maintenance cycles
    const weekendFactor = date.getDay() === 0 || date.getDay() === 6 ? 0.8 : 1.0 // Weekend adjustment

    return {
      totalTrainsets: baseStats.totalTrainsets,
      readyForService: Math.max(25, Math.floor((baseStats.readyForService + variance * 5) * weekendFactor)),
      standby: Math.max(8, Math.floor(baseStats.standby + variance * 3 + maintenanceCycle * 2)),
      inMaintenance: Math.max(2, Math.floor(baseStats.inMaintenance + maintenanceCycle * 3 - variance * 2)),
      alerts: Math.max(0, Math.floor(baseStats.alerts + variance * 4 + (dayDiff > 10 ? 2 : 0)))
    }
  }

  // Generate induction predictions for selected date
  const generateInductionPredictions = (date: Date) => {
    const today = new Date()
    const dayDiff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    const baseTrains = [
      { id: 'T-101', baseConfidence: 92, baseStatus: 'Service', baseReason: 'Fitness OK, Branding Priority, Balanced Mileage' },
      { id: 'T-103', baseConfidence: 88, baseStatus: 'IBL', baseReason: 'Open Job Card: Brake Inspection Pending' },
      { id: 'T-105', baseConfidence: 85, baseStatus: 'Service', baseReason: 'All Systems Green, Low Mileage Priority' },
      { id: 'T-107', baseConfidence: 78, baseStatus: 'Standby', baseReason: 'High Mileage, Needs Rest Cycle' },
      { id: 'T-109', baseConfidence: 72, baseStatus: 'Service', baseReason: 'Regular Maintenance Completed' }
    ]

    return baseTrains.map((train, index) => {
      const variance = (Math.sin(dayDiff * 0.5 + index) * 10) + (Math.random() * 8 - 4)
      const confidence = Math.max(65, Math.min(95, train.baseConfidence + variance))
      
      // Predict status changes based on confidence and day
      let status = train.baseStatus
      let reason = train.baseReason
      
      if (dayDiff > 0) {
        if (train.baseStatus === 'IBL' && dayDiff >= 2) {
          status = 'Service'
          reason = 'Maintenance Completed - Ready for Service'
        } else if (train.baseStatus === 'Service' && confidence < 75) {
          status = 'Standby'
          reason = 'Predicted Performance Degradation'
        } else if (dayDiff > 7 && Math.random() > 0.7) {
          status = 'IBL'
          reason = 'Scheduled Preventive Maintenance'
        }
      }

      return {
        ...train,
        confidence: Math.round(confidence),
        status,
        reason,
        rank: index + 1
      }
    }).sort((a, b) => b.confidence - a.confidence)
  }

  const predictions = generatePredictions(selectedDate)
  const inductionPredictions = generateInductionPredictions(selectedDate)

  // Generate next 15 days for date picker
  const getNext15Days = () => {
    const days = []
    const today = new Date()
    for (let i = 0; i < 15; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push(date)
    }
    return days
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Service': return 'bg-green-100 text-green-800'
      case 'IBL': return 'bg-orange-100 text-orange-800'
      case 'Standby': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Service': return <CheckCircle className="w-4 h-4" />
      case 'IBL': return <Settings className="w-4 h-4" />
      case 'Standby': return <Pause className="w-4 h-4" />
      default: return <HelpCircle className="w-4 h-4" />
    }
  }

  return (
    <RoleGuard role="Operator">
      <div className="h-screen relative flex">
        <AnimatedBackground />
        <div className="relative z-10 w-full flex">
        {/* Operator Sidebar */}
        <OperatorSidebar onSidebarChange={setIsSidebarExpanded} />
        
        {/* Main Content */}
        <div 
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarExpanded ? 'lg:pl-64' : 'lg:pl-16'
          }`}
        >
          {/* Fixed Operator Header */}
          <OperatorHeader user={user} isSidebarExpanded={isSidebarExpanded} />
          
          {/* Scrollable Dashboard Content */}
          <main className="flex-1 overflow-auto pt-20 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Welcome Message */}
              <div className="mb-8">
                {/* Welcome Card */}
                <div className="bg-card text-card-foreground overflow-hidden shadow rounded-lg p-6 mb-6">
                  <h1 className="text-2xl font-bold text-foreground">
                    <TranslatedText text="Welcome, Train Operator" />
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <TranslatedText text="Train Operations Dashboard - Monitor & Control Your Assigned Fleet" />
                  </p>
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Hi, {user?.name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Ready to manage your fleet operations
                    </p>
                  </div>
                  
                  {/* Date Picker */}
                  <div className="relative date-picker-container">
                    <Button
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      {formatDate(selectedDate)}
                      {selectedDate.toDateString() !== new Date().toDateString() && (
                        <span className="ml-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          <TranslatedText text="AI Prediction" />
                        </span>
                      )}
                    </Button>
                    
                    {showDatePicker && (
                      <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 min-w-80">
                        <div className="mb-3">
                          <h3 className="text-sm font-medium text-gray-900 mb-2"><TranslatedText text="Select Date" /></h3>
                          <p className="text-xs text-gray-500"><TranslatedText text="AI Predictions Available" /></p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {getNext15Days().map((date, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSelectedDate(date)
                                setShowDatePicker(false)
                              }}
                              className={`p-2 text-sm rounded-md border transition-colors ${
                                date.toDateString() === selectedDate.toDateString()
                                  ? 'bg-blue-500 text-white border-blue-500'
                                  : index === 0
                                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <div className="font-medium">{formatDate(date)}</div>
                              <div className="text-xs opacity-75">
                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            🤖 Predictions powered by MetroMind AI using historical data, maintenance schedules, and operational patterns
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>



              {/* Dashboard Content */}
              <div className="space-y-8">
                  {/* Quick Stats Widgets */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Total Trainsets */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <Train className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate"><TranslatedText text="Total Trainsets" /></dt>
                              <dd className="text-2xl font-bold text-gray-900">{predictions.totalTrainsets}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ready for Service */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate"><TranslatedText text="Ready for Service" /></dt>
                              <dd className="text-2xl font-bold text-green-600">{predictions.readyForService}</dd>
                              {selectedDate.toDateString() !== new Date().toDateString() && (
                                <dd className="text-xs text-gray-500 mt-1"><TranslatedText text="AI Predicted" /></dd>
                              )}
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Standby */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">⏸️</span>
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate"><TranslatedText text="Standby" /></dt>
                              <dd className="text-2xl font-bold text-yellow-600">{predictions.standby}</dd>
                              {selectedDate.toDateString() !== new Date().toDateString() && (
                                <dd className="text-xs text-gray-500 mt-1"><TranslatedText text="AI Predicted" /></dd>
                              )}
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* In IBL (Maintenance) */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">�</span>
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate"><TranslatedText text="In Maintenance" /></dt>
                              <dd className="text-2xl font-bold text-orange-600">{predictions.inMaintenance}</dd>
                              {selectedDate.toDateString() !== new Date().toDateString() && (
                                <dd className="text-xs text-gray-500 mt-1"><TranslatedText text="AI Predicted" /></dd>
                              )}
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alerts */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                              <AlertTriangle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate"><TranslatedText text="Alerts" /></dt>
                              <dd className="text-2xl font-bold text-red-600">{predictions.alerts}</dd>
                              {selectedDate.toDateString() !== new Date().toDateString() && (
                                <dd className="text-xs text-gray-500 mt-1"><TranslatedText text="AI Predicted" /></dd>
                              )}
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tonight's Induction List */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {selectedDate.toDateString() === new Date().toDateString() 
                            ? <TranslatedText text="Tonight's Induction Priority" />
                            : <><TranslatedText text="Induction Predictions for" /> {formatDate(selectedDate)} (AI Output – Ranked)</>
                          }
                        </h3>
                        {selectedDate.toDateString() !== new Date().toDateString() && (
                          <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                            🤖 AI Prediction
                          </span>
                        )}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><TranslatedText text="Rank" /></th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><TranslatedText text="Train ID" /></th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><TranslatedText text="Status" /></th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><TranslatedText text="Confidence" /> %</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><TranslatedText text="Reason Tags" /></th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {inductionPredictions.map((train, index) => {
                              const statusColor = getStatusColor(train.status)
                              const statusIcon = getStatusIcon(train.status)
                              
                              return (
                                <tr 
                                  key={train.id} 
                                  className={`${
                                    train.status === 'Service' ? 'bg-green-50' :
                                    train.status === 'IBL' ? 'bg-orange-50' :
                                    train.status === 'Standby' ? 'bg-yellow-50' : 'bg-red-50'
                                  }`}
                                >
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                                    train.status === 'Service' ? 'text-green-800' :
                                    train.status === 'IBL' ? 'text-orange-800' :
                                    train.status === 'Standby' ? 'text-yellow-800' : 'text-red-800'
                                  }`}>
                                    {index + 1}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {train.id}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                                      {statusIcon} {train.status}
                                    </span>
                                  </td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                                    train.status === 'Service' ? 'text-green-600' :
                                    train.status === 'IBL' ? 'text-orange-600' :
                                    train.status === 'Standby' ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {train.confidence}%
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900">
                                    {train.reason}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </main>
        </div>
        </div>
      </div>
    </RoleGuard>
  )
}
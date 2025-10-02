"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { RoleGuard } from '@/hooks/use-role-access'
import { OperatorSidebar } from '@/components/operator/operator-sidebar'
import { OperatorHeader } from '@/components/operator/operator-header'
import { OperatorMetricsCards } from '@/components/operator/operator-metrics-cards'
import { OperatorTrainMonitor } from '@/components/operator/operator-train-monitor'
import { OperatorAlerts } from '@/components/operator/operator-alerts'
import OperatorFileUpload from '@/components/operator/operator-file-upload'
import DebugAuth from '@/components/debug-auth'
import OperatorUploadHistory from '@/components/operator/operator-upload-history'
import AIPredictionsDashboard from '@/components/ai-predictions-dashboard'
import AIPredictionsSummary from '@/components/ai-predictions-summary'

export default function OperatorDashboard() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <RoleGuard role="Operator">
      <div className="min-h-screen bg-gray-50">
        {/* Operator Sidebar */}
        <OperatorSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        
        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Operator Header */}
          <OperatorHeader 
            user={user} 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
          />
          
          {/* Operator Dashboard Content */}
          <main className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Welcome Message */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {user?.name}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Train Operations Dashboard - Monitor & Control Your Assigned Fleet
                </p>
              </div>

              {/* Dashboard Navigation Tabs */}
              <div className="mb-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveSection('overview')}
                    className={`${
                      activeSection === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveSection('upload')}
                    className={`${
                      activeSection === 'upload'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium`}
                  >
                    Upload Documents
                  </button>
                  <button
                    onClick={() => setActiveSection('ai-predictions')}
                    className={`${
                      activeSection === 'ai-predictions'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium`}
                  >
                    AI Predictions
                  </button>
                </nav>
              </div>

              {/* Dashboard Content */}
              {activeSection === 'overview' && (
                <>
                  {/* Operator Metrics Cards */}
                  <OperatorMetricsCards />

                  {/* Operator Dashboard Grid */}
                  <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Train Monitoring */}
                    <div className="lg:col-span-2">
                      <OperatorTrainMonitor />
                    </div>
                    
                    {/* Right Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                      {/* Active Alerts */}
                      <OperatorAlerts />
                      
                      {/* AI Predictions Summary */}
                      <AIPredictionsSummary 
                        onShowFull={() => setActiveSection('ai-predictions')}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'upload' && (
                <div className="max-w-6xl space-y-8">
                  <DebugAuth />
                  {/* Upload Section */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                      Document Upload Center
                    </h2>
                    <p className="text-sm text-gray-600 mb-8">
                      Upload Excel, CSV, or PDF files for processing and storage. 
                      Data files will be automatically parsed and imported into the system.
                    </p>
                    <OperatorFileUpload />
                  </div>

                  {/* Upload History Section */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <OperatorUploadHistory />
                  </div>
                </div>
              )}

              {activeSection === 'ai-predictions' && (
                <div className="max-w-7xl">
                  <AIPredictionsDashboard />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  )
}
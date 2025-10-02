"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { RoleGuard } from '@/hooks/use-role-access'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminMetricsCards } from '@/components/admin/admin-metrics-cards'
import { AdminTrainOverview } from '@/components/admin/admin-train-overview'
import { AdminSystemHealth } from '@/components/admin/admin-system-health'
import { AdminUserActivity } from '@/components/admin/admin-user-activity'
import AIPredictionsDashboard from '@/components/ai-predictions-dashboard'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <RoleGuard role="Admin">
      <div className="min-h-screen bg-gray-50">
        {/* Admin Sidebar */}
        <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        
        {/* Main Content */}
        <div className="lg:pl-72">
          {/* Admin Header */}
          <AdminHeader 
            user={user} 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
          />
          
          {/* Admin Dashboard Content */}
          <main className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Welcome Message */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.name}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Admin Dashboard - Complete System Control & Management
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
                  {/* Admin Metrics Cards */}
                  <AdminMetricsCards />

                  {/* Admin Dashboard Grid */}
                  <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Train Fleet Overview */}
                    <AdminTrainOverview />
                    
                    {/* System Health Monitor */}
                    <AdminSystemHealth />
                  </div>

                  {/* User Activity & Logs */}
                  <div className="mt-8">
                    <AdminUserActivity />
                  </div>
                </>
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
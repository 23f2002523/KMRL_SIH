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

export default function AdminDashboard() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  )
}
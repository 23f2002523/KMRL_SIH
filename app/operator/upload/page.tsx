"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { RoleGuard } from '@/hooks/use-role-access'
import { OperatorSidebar } from '@/components/operator/operator-sidebar'
import { OperatorHeader } from '@/components/operator/operator-header'
import OperatorFileUpload from '@/components/operator/operator-file-upload'
import OperatorUploadHistory from '@/components/operator/operator-upload-history'
import DebugAuth from '@/components/debug-auth'

export default function OperatorUploadPage() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
          
          {/* Upload Page Content */}
          <main className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                  Document Upload Center
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Upload Excel, CSV, or PDF files for processing and storage. Data files will be automatically parsed and imported into the system.
                </p>
              </div>

              

              {/* Upload Section */}
              <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  File Upload
                </h2>
                <p className="text-sm text-gray-600 mb-8">
                  Select files to upload. Supported formats: Excel (.xlsx, .xls), CSV (.csv), and PDF (.pdf)
                </p>
                <OperatorFileUpload />
              </div>

              {/* Upload History Section */}
              <div className="bg-white shadow rounded-lg p-6">
                <OperatorUploadHistory />
              </div>
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  )
}
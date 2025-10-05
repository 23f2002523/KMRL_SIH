"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { TranslatedText } from '@/components/translation/libre-translated-text'
import { RoleGuard } from '@/hooks/use-role-access'
import { OperatorSidebar } from '@/components/operator/operator-sidebar'
import { OperatorHeader } from '@/components/operator/operator-header'
import { AnimatedBackground } from '@/components/animated-background'
import OperatorFileUpload from '@/components/operator/operator-file-upload'
import OperatorUploadHistory from '@/components/operator/operator-upload-history'
import DebugAuth from '@/components/debug-auth'

export default function OperatorUploadPage() {
  const { user } = useAuth()
  // Using dynamic translations
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

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
          {/* Operator Header */}
          <OperatorHeader 
            user={user} 
            isSidebarExpanded={isSidebarExpanded}
          />
          
          {/* Upload Page Content */}
          <main className="flex-1 overflow-auto pt-20 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Page Header */}
              <div className="bg-card text-card-foreground overflow-hidden shadow rounded-lg p-6 mb-8">
                <h1 className="text-2xl font-bold text-foreground">
                  <TranslatedText text="Upload Documents" />
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  <TranslatedText text="Upload and manage your document files" />
                </p>
              </div>

              

              {/* Upload Section */}
              <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  <TranslatedText text="File Upload" />
                </h2>
                <p className="text-sm text-gray-600 mb-8">
                  <TranslatedText text="Supported formats: CSV files only" />
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
      </div>
    </RoleGuard>
  )
}
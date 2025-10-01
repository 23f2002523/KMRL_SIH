"use client"

import { useState } from "react"
import { TopHeader } from "./top-header"
import { HamburgerSidebar } from "./hamburger-sidebar"

interface MainLayoutProps {
  children: React.ReactNode
  alertCount?: number
}

export function MainLayout({ children, alertCount = 0 }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-gradient-teal-soft dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-800">
      {/* Top Header */}
      <TopHeader onMenuToggle={toggleSidebar} alertCount={alertCount} />
      
      {/* Hamburger Sidebar */}
      <HamburgerSidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        alertCount={alertCount}
      />
      
      {/* Main Content */}
      <main id="main-content" className="pt-16" role="main" tabIndex={-1}>
        {children}
      </main>
      
      {/* Demo Footer */}
      <footer className="mt-8 py-4 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-teal-primary/20" role="contentinfo">
        <div className="flex items-center justify-center space-x-2">
          <span>Powered by</span>
          <span className="font-semibold text-teal-primary">KMRL-SIH 2025</span>
          <span>•</span>
          <span>Smart Innovation Hub</span>
        </div>
      </footer>
    </div>
  )
}
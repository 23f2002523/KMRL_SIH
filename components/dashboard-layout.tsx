"use client"

import type React from "react"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
  language: "en" | "ml"
  onLanguageChange: (lang: "en" | "ml") => void
  className?: string
}

export function DashboardLayout({ children, language, onLanguageChange, className }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <DashboardSidebar language={language} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <DashboardHeader
          language={language}
          onLanguageChange={onLanguageChange}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

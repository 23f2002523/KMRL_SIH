"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  Calendar, 
  Settings, 
  Bell,
  X,
  Home
} from "lucide-react"

interface HamburgerSidebarProps {
  isOpen: boolean
  onClose: () => void
  alertCount?: number
}

const navigationItems = [
  {
    name: "Trainset Overview",
    href: "/overview",
    icon: BarChart3,
    description: "Dashboard and metrics"
  },
  {
    name: "Induction Plan",
    href: "/plan", 
    icon: Calendar,
    description: "AI-generated induction planning"
  },
  {
    name: "Simulation Plan",
    href: "/simulation",
    icon: Settings,
    description: "What-if scenario analysis"
  },
  {
    name: "Alerts & Notifications",
    href: "/alerts",
    icon: Bell,
    description: "System alerts and updates"
  }
]

export function HamburgerSidebar({ isOpen, onClose, alertCount = 0 }: HamburgerSidebarProps) {
  const pathname = usePathname()

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 h-full w-80 bg-gradient-teal-soft backdrop-blur-xl shadow-teal-lg z-50 transform transition-transform border-r border-teal-primary/20"
        role="navigation"
        aria-label="Main navigation menu"
        id="navigation-menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-teal-primary/20 bg-gradient-teal">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30" aria-hidden="true">
              <span className="text-white font-bold">K</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">KMRL</h1>
              <p className="text-sm text-white/80">Train Management System</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-2">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-teal-primary uppercase tracking-wider mb-3">
              Navigation
            </h2>
            
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              const showBadge = item.href === "/alerts" && alertCount > 0

              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={onClose}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group focus-visible navbar-glow",
                    isActive
                      ? "bg-gradient-teal text-white shadow-teal"
                      : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:text-teal-primary hover:shadow-sm"
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  aria-describedby={`nav-desc-${item.href.replace('/', '')}`}
                >
                    <div className="flex items-center space-x-3 flex-1">
                      <Icon className={cn(
                        "h-5 w-5 transition-colors",
                        isActive 
                          ? "text-white" 
                          : "text-teal-primary group-hover:text-teal-primary"
                      )} />
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className={cn(
                          "text-xs mt-0.5",
                          isActive 
                            ? "text-white/80" 
                            : "text-gray-600 dark:text-gray-400 group-hover:text-teal-primary/80"
                        )}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                    
                    {showBadge && (
                      <Badge variant="destructive" className="ml-2">
                        {alertCount > 99 ? '99+' : alertCount}
                      </Badge>
                    )}
                </Link>
              )
            })}
          </div>

          {/* Quick Stats */}
          <div className="pt-6 border-t border-teal-primary/20">
            <h3 className="text-xs font-semibold text-teal-primary uppercase tracking-wider mb-3">
              Quick Stats
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-teal-primary/10">
                <div className="text-2xl font-bold text-teal-primary">25</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Trainsets</div>
              </div>
              
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-teal-primary/10">
                <div className="text-2xl font-bold text-emerald-600">18</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Active</div>
              </div>
              
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-teal-primary/10">
                <div className="text-2xl font-bold text-amber-600">4</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Maintenance</div>
              </div>
              
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-teal-primary/10">
                <div className="text-2xl font-bold text-red-500">{alertCount}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Alerts</div>
              </div>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-teal-primary/20 bg-gradient-teal">
          <div className="text-center">
            <p className="text-xs text-white/90">
              © 2025 Kochi Metro Rail Ltd.
            </p>
            <p className="text-xs text-white/70 mt-1">
              Train Management System v2.0
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
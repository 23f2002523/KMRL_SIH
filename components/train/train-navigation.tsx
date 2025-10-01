"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  AlertTriangle, 
  Calendar, 
  Settings,
  Train
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

interface TrainNavigationProps {
  alertCount?: number
}

export function TrainNavigation({ alertCount = 0 }: TrainNavigationProps) {
  const pathname = usePathname()

  const navigationItems: NavigationItem[] = [
    {
      href: "/overview",
      label: "Trainset Overview",
      icon: <BarChart3 className="h-4 w-4" />
    },
    {
      href: "/alerts", 
      label: "Alerts & Notifications",
      icon: <AlertTriangle className="h-4 w-4" />,
      badge: alertCount > 0 ? alertCount : undefined
    },
    {
      href: "/plan",
      label: "Induction Plan", 
      icon: <Calendar className="h-4 w-4" />
    },
    {
      href: "/simulation",
      label: "Simulation Panel",
      icon: <Settings className="h-4 w-4" />
    }
  ]

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/overview" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Train className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  KMRL Train Management
                </h1>
                <p className="text-xs text-gray-500">
                  Induction Planning System
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-8">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <span className="flex items-center space-x-2">
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge 
                        className={cn(
                          "ml-2 text-xs",
                          isActive 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-red-100 text-red-800"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* User Profile */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Admin User
                </p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Calendar, 
  Settings, 
  Bell, 
  ChevronLeft,
  ChevronRight,
  Search,
  Sun,
  Moon,
  Monitor
} from "lucide-react"
import { useTheme } from "next-themes"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface SidebarNavigationProps {
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

export function SidebarNavigation({ alertCount = 0 }: SidebarNavigationProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const toggleCollapsed = () => setCollapsed(!collapsed)

  const handleSearch = () => {
    setCommandOpen(true)
  }

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun
      case 'dark': return Moon
      default: return Monitor
    }
  }

  const ThemeIcon = getThemeIcon()

  return (
    <>
      <div 
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">KMRL</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Train Management</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="p-2"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Search */}
        <div className="p-4">
          <Button
            variant="outline"
            onClick={handleSearch}
            className={cn(
              "w-full justify-start text-sm text-gray-500 dark:text-gray-400",
              collapsed && "px-2"
            )}
          >
            <Search className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Search... (Ctrl+K)</span>}
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            const showBadge = item.href === "/alerts" && alertCount > 0

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                  {!collapsed && (
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.description}
                        </div>
                      </div>
                      {showBadge && (
                        <Badge variant="destructive" className="ml-2">
                          {alertCount}
                        </Badge>
                      )}
                    </div>
                  )}
                  {collapsed && showBadge && (
                    <div className="absolute left-8 top-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Theme Toggle - Bottom */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Button
            variant="ghost"
            onClick={cycleTheme}
            className={cn(
              "w-full justify-start",
              collapsed && "justify-center px-2"
            )}
            title={`Current theme: ${theme}. Click to cycle.`}
          >
            <ThemeIcon className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && (
              <span className="capitalize">
                {theme === 'system' ? 'Auto' : theme} Mode
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Command Dialog for Search */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search navigation..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => {
                  setCommandOpen(false)
                  window.location.href = item.href
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => {
              setCommandOpen(false)
              cycleTheme()
            }}>
              <ThemeIcon className="mr-2 h-4 w-4" />
              <span>Toggle Theme</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Content shift for collapsed state */}
      <style jsx global>{`
        .main-content {
          margin-left: ${collapsed ? '4rem' : '16rem'};
          transition: margin-left 0.3s ease;
        }
        
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }
        }
      `}</style>

      {/* Keyboard shortcut listener */}
      <div
        className="fixed inset-0 pointer-events-none"
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault()
            setCommandOpen(true)
          }
        }}
        tabIndex={-1}
      />
      
      {/* Mobile overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleCollapsed}
        />
      )}
    </>
  )
}
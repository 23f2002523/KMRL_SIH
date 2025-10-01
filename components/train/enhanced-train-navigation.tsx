"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  BarChart3, 
  AlertTriangle, 
  Calendar, 
  Settings,
  Train,
  Search,
  Moon,
  Sun,
  Command
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useTheme } from "next-themes"

interface NavigationItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

interface SearchResult {
  id: string
  title: string
  type: 'trainset' | 'alert' | 'plan' | 'page'
  description: string
  href: string
}

interface EnhancedTrainNavigationProps {
  alertCount?: number
}

export function EnhancedTrainNavigation({ 
  alertCount = 0
}: EnhancedTrainNavigationProps) {
  const { theme, setTheme } = useTheme()
  const isDarkMode = theme === 'dark'
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

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

  // Mock search data - in real app, this would come from API
  const allSearchData: SearchResult[] = [
    // Pages
    { id: 'page-overview', title: 'Trainset Overview', type: 'page', description: 'View all trainsets and their status', href: '/overview' },
    { id: 'page-alerts', title: 'Alerts & Notifications', type: 'page', description: 'Manage system alerts and warnings', href: '/alerts' },
    { id: 'page-plan', title: 'Induction Plan', type: 'page', description: 'AI-generated induction planning', href: '/plan' },
    { id: 'page-simulation', title: 'Simulation Panel', type: 'page', description: 'Run what-if scenarios', href: '/simulation' },
    
    // Trainsets
    { id: 'train-001', title: 'KMRL-2024-001', type: 'trainset', description: 'Metro Coach - Active Service', href: '/overview?search=KMRL-2024-001' },
    { id: 'train-002', title: 'KMRL-2024-002', type: 'trainset', description: 'Metro Coach - Maintenance', href: '/overview?search=KMRL-2024-002' },
    { id: 'train-003', title: 'KMRL-2024-003', type: 'trainset', description: 'Metro Coach - Reserve', href: '/overview?search=KMRL-2024-003' },
    { id: 'train-008', title: 'KMRL-2023-008', type: 'trainset', description: 'Metro Coach - Critical Alert', href: '/overview?search=KMRL-2023-008' },
    
    // Alerts
    { id: 'alert-1', title: 'Branding Exposure Alert', type: 'alert', description: 'Trainset #12 branding exposure at 70%', href: '/alerts?filter=warning' },
    { id: 'alert-2', title: 'Fitness Certificate Expired', type: 'alert', description: 'Trainset #8 - immediate action required', href: '/alerts?filter=critical' },
    { id: 'alert-3', title: 'Maintenance Overdue', type: 'alert', description: 'Trainset #5 overdue by 48 hours', href: '/alerts?filter=error' },
    { id: 'alert-4', title: 'Depot Capacity Alert', type: 'alert', description: 'Depot 3 approaching 85% capacity', href: '/alerts?filter=warning' },
    
    // Plans
    { id: 'plan-1', title: 'Service Assignment Plan', type: 'plan', description: 'AI-generated service allocation', href: '/plan?type=service' },
    { id: 'plan-2', title: 'Maintenance Schedule', type: 'plan', description: 'Optimized maintenance planning', href: '/plan?type=maintenance' },
    { id: 'plan-3', title: 'Standby Rotation', type: 'plan', description: 'Strategic reserve management', href: '/plan?type=standby' },
  ]

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const filtered = allSearchData.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    )
    setSearchResults(filtered)
  }

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'trainset': return <Train className="h-4 w-4" />
      case 'alert': return <AlertTriangle className="h-4 w-4" />
      case 'plan': return <Calendar className="h-4 w-4" />
      case 'page': return <BarChart3 className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: SearchResult['type']) => {
    const config = {
      trainset: 'bg-blue-100 text-blue-800',
      alert: 'bg-red-100 text-red-800',
      plan: 'bg-green-100 text-green-800',
      page: 'bg-purple-100 text-purple-800'
    }
    return (
      <Badge className={cn('text-xs', config[type])}>
        {type}
      </Badge>
    )
  }

  return (
    <>
      <nav className={cn(
        "border-b shadow-sm transition-colors duration-200",
        isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link href="/overview" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Train className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className={cn(
                    "text-lg font-semibold transition-colors",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>
                    KMRL Train Management
                  </h1>
                  <p className={cn(
                    "text-xs transition-colors",
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Induction Planning System
                  </p>
                </div>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
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
                        : isDarkMode
                        ? "border-transparent text-gray-300 hover:text-white hover:border-gray-600"
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

            {/* Right Side - Search, Theme Toggle, User Profile */}
            <div className="flex items-center space-x-4">
              {/* Global Search */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchOpen(true)}
                className={cn(
                  "hidden sm:flex items-center space-x-2",
                  isDarkMode ? "border-gray-700 text-gray-300" : "border-gray-300"
                )}
              >
                <Search className="h-4 w-4" />
                <span className="text-sm">Search...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>

              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchOpen(true)}
                className="sm:hidden"
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                className={cn(
                  "transition-colors",
                  isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                )}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className={cn(
                    "text-sm font-medium transition-colors",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>
                    Admin User
                  </p>
                  <p className={cn(
                    "text-xs transition-colors",
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    {new Date().toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Global Search Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput 
          placeholder="Search trainsets, alerts, plans..." 
          onValueChange={handleSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {searchResults.length > 0 && (
            <>
              <CommandGroup heading="Pages">
                {searchResults.filter(item => item.type === 'page').map((item) => (
                  <CommandItem key={item.id} onSelect={() => window.location.href = item.href}>
                    <div className="flex items-center space-x-3 w-full">
                      {getTypeIcon(item.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.title}</span>
                          {getTypeBadge(item.type)}
                        </div>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading="Trainsets">
                {searchResults.filter(item => item.type === 'trainset').map((item) => (
                  <CommandItem key={item.id} onSelect={() => window.location.href = item.href}>
                    <div className="flex items-center space-x-3 w-full">
                      {getTypeIcon(item.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.title}</span>
                          {getTypeBadge(item.type)}
                        </div>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading="Alerts">
                {searchResults.filter(item => item.type === 'alert').map((item) => (
                  <CommandItem key={item.id} onSelect={() => window.location.href = item.href}>
                    <div className="flex items-center space-x-3 w-full">
                      {getTypeIcon(item.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.title}</span>
                          {getTypeBadge(item.type)}
                        </div>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading="Plans">
                {searchResults.filter(item => item.type === 'plan').map((item) => (
                  <CommandItem key={item.id} onSelect={() => window.location.href = item.href}>
                    <div className="flex items-center space-x-3 w-full">
                      {getTypeIcon(item.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.title}</span>
                          {getTypeBadge(item.type)}
                        </div>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
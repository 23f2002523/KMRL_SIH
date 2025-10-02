"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/hooks/use-auth"
import {
  BarChart3,
  Settings,
  Users,
  Shield,
  Bell,
  Archive,
  Workflow,
  Menu,
  X,
  LogOut,
  User,
  Crown,
  Eye,
  Train,
  Activity,
} from "lucide-react"

// Navigation item type
interface NavigationItem {
  translationKey: string
  href: string
  icon: any
  allowedRoles: ('Admin' | 'Operator' | 'Viewer')[]
  badge?: string
  description?: string
}

// Role-based navigation items
const getNavigationItems = (userRole: 'Admin' | 'Operator' | 'Viewer'): NavigationItem[] => {
  const baseItems: NavigationItem[] = [
    { translationKey: "Dashboard", href: "/", icon: BarChart3, allowedRoles: ['Admin', 'Operator'] },
  ]

  const adminItems: NavigationItem[] = [
    // User Management
    { translationKey: "User Management", href: "/admin/users", icon: Users, allowedRoles: ['Admin'], badge: "Admin", description: "Manage operators & users" },
    
    // Train Management (Full Access)
    { translationKey: "Train Management", href: "/admin/trains", icon: Shield, allowedRoles: ['Admin'], description: "Full train & route control" },
    
    // Reports & Analytics (Full)
    { translationKey: "System Reports", href: "/admin/reports", icon: BarChart3, allowedRoles: ['Admin'], description: "Complete system analytics" },
    
    // System Settings
    { translationKey: "System Settings", href: "/admin/settings", icon: Settings, allowedRoles: ['Admin'], description: "System-wide configuration" },
    
    // Audit Logs
    { translationKey: "Audit Logs", href: "/admin/audit", icon: Archive, allowedRoles: ['Admin'], description: "User activity & system logs" },
    
    // Notifications Management
    { translationKey: "Notifications", href: "/admin/notifications", icon: Bell, allowedRoles: ['Admin'], badge: "5" },
  ]

  const operatorItems: NavigationItem[] = [
    // Train Operations (Limited)
    { translationKey: "Train Operations", href: "/operator/trains", icon: Workflow, allowedRoles: ['Admin', 'Operator'], description: "Schedule & operational control" },
    
    // Service Management
    { translationKey: "Service Status", href: "/operator/services", icon: Activity, allowedRoles: ['Admin', 'Operator'], description: "Monitor train services" },
    
    // Operational Reports (Limited)
    { translationKey: "Operations Reports", href: "/operator/reports", icon: BarChart3, allowedRoles: ['Admin', 'Operator'], description: "Operational statistics only" },
    
    // Notifications (View Only)
    { translationKey: "Alerts", href: "/operator/alerts", icon: Bell, allowedRoles: ['Admin', 'Operator'], badge: "3" },
  ]

  // Filter items based on user role
  const allItems = [...baseItems, ...adminItems, ...operatorItems]
  return allItems.filter(item => item.allowedRoles.includes(userRole))
}

export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { language, t } = useLanguage()
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <div
      className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border", isCollapsed ? "w-16" : "w-64")}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
               <div className="w-30 h-15 rounded-lg flex items-center justify-center">
                 <img src="/MetroMind.png" alt="Logo" className="h-20 w-20"/>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">MetroMind AI</span>
              <span className="text-xs text-sidebar-foreground/70">
                {language === "en" ? "Train Management System" : "ട്രെയിൻ മാനേജ്മെന്റ് സിസ്റ്റം"}
              </span>
            </div>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="h-8 w-8 p-0 navbar-glow"
          aria-label={t('accessibility.toggleSidebar')}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Role-Based Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {user && getNavigationItems(user.role).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10 navbar-glow",
                    isCollapsed && "justify-center px-2",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                  aria-label={item.translationKey}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{item.translationKey}</div>
                        {item.description && (
                          <div className="text-xs text-sidebar-foreground/60 mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {item.badge && (
                        <Badge 
                          variant={item.badge === "Admin" ? "destructive" : "secondary"} 
                          className="ml-auto h-5 px-1.5 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            )
          })}
          
          {/* Role Indicator Section */}
          {user && !isCollapsed && (
            <div className="px-3 py-2 mt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                  {user.role} Access
                </p>
                <Badge variant={user.role === 'Admin' ? 'destructive' : 'default'} className="text-xs">
                  {user.role === 'Admin' ? 'Full Access' : 'Limited Access'}
                </Badge>
              </div>
              <p className="text-xs text-sidebar-foreground/50 mt-1">
                {user.role === 'Admin' 
                  ? 'Complete system administration' 
                  : 'Operational tasks only'
                }
              </p>
            </div>
          )}
        </nav>
      </ScrollArea>

      {/* User Profile & Auth */}
      {isAuthenticated && user && (
        <div className="border-t border-sidebar-border p-4">
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <Avatar className="h-10 w-10 border-2 border-teal-200 dark:border-teal-800">
              <AvatarFallback className="bg-teal-600 text-white font-semibold">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate mb-1">
                  {user.email}
                </p>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={user.role === 'Admin' ? 'destructive' : user.role === 'Operator' ? 'default' : 'secondary'}
                    className="text-xs gap-1"
                  >
                    {user.role === 'Admin' && <Crown className="h-3 w-3" />}
                    {user.role === 'Operator' && <Settings className="h-3 w-3" />}
                    {user.role === 'Viewer' && <Eye className="h-3 w-3" />}
                    {user.role}
                  </Badge>
                  <span className="text-xs text-sidebar-foreground/50">#{user.userId}</span>
                </div>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="mt-3 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 h-8 text-xs navbar-glow"
                onClick={() => router.push('/profile')}
              >
                <User className="h-3 w-3" />
                Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 navbar-glow"
                onClick={() => {
                  logout()
                  router.push('/login')
                }}
              >
                <LogOut className="h-3 w-3" />
                Sign Out
              </Button>
            </div>
          )}
          
          {isCollapsed && (
            <div className="mt-2 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 navbar-glow"
                onClick={() => {
                  logout()
                  router.push('/login')
                }}
                aria-label="Sign Out"
              >
                <LogOut className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Login Button for Unauthenticated Users */}
      {!isAuthenticated && (
        <div className="border-t border-sidebar-border p-4">
          <Button
            className={cn("w-full bg-teal-600 hover:bg-teal-700", isCollapsed && "px-2")}
            onClick={() => router.push('/login')}
          >
            {isCollapsed ? <User className="h-4 w-4" /> : "Sign In"}
          </Button>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/hooks/use-language"
import {
  FileText,
  Upload,
  Search,
  BarChart3,
  Settings,
  Users,
  Shield,
  Bell,
  Archive,
  Workflow,
  Brain,
  Menu,
  X,
} from "lucide-react"

// Navigation items with translation keys
const navigationItems = [
  { translationKey: "nav.overview", href: "/overview", icon: BarChart3 },
  { translationKey: "nav.documents", href: "/documents", icon: FileText, badge: "12" },
  { translationKey: "nav.upload", href: "/upload", icon: Upload },
  { translationKey: "nav.search", href: "/search", icon: Search },
  { translationKey: "nav.workflow", href: "/workflow", icon: Workflow, badge: "3" },
  { translationKey: "nav.aiChat", href: "/ai-chat", icon: Brain },
  { translationKey: "nav.analytics", href: "/analytics", icon: BarChart3 },
  { translationKey: "nav.archive", href: "/archive", icon: Archive },
  { translationKey: "nav.users", href: "/users", icon: Users },
  { translationKey: "nav.notifications", href: "/notifications", icon: Bell, badge: "5" },
  { translationKey: "nav.settings", href: "/settings", icon: Settings },
]

export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { language, t } = useLanguage()

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
                {language === "en" ? "Document Assistant" : "രേഖ സഹായി"}
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

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
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
                  aria-label={t(item.translationKey)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{t(item.translationKey)}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}

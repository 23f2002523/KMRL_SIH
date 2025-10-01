"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
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

interface SidebarProps {
  language: "en" | "ml"
}

const navigationItems = {
  en: [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Documents", href: "/documents", icon: FileText, badge: "12" },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Search", href: "/search", icon: Search },
    { name: "Workflow", href: "/workflow", icon: Workflow, badge: "3" },
    { name: "AI Assistant", href: "/ai-chat", icon: Brain },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Archive", href: "/archive", icon: Archive },
    { name: "Users", href: "/users", icon: Users },
    { name: "Notifications", href: "/notifications", icon: Bell, badge: "5" },
    { name: "Settings", href: "/settings", icon: Settings },
  ],
  ml: [
    { name: "ഡാഷ്ബോർഡ്", href: "/", icon: BarChart3 },
    { name: "രേഖകൾ", href: "/documents", icon: FileText, badge: "12" },
    { name: "അപ്‌ലോഡ്", href: "/upload", icon: Upload },
    { name: "തിരയൽ", href: "/search", icon: Search },
    { name: "വർക്ക്ഫ്ലോ", href: "/workflow", icon: Workflow, badge: "3" },
    { name: "AI സഹായി", href: "/ai-chat", icon: Brain },
    { name: "അനലിറ്റിക്സ്", href: "/analytics", icon: BarChart3 },
    { name: "ആർക്കൈവ്", href: "/archive", icon: Archive },
    { name: "ഉപയോക്താക്കൾ", href: "/users", icon: Users },
    { name: "അറിയിപ്പുകൾ", href: "/notifications", icon: Bell, badge: "5" },
    { name: "ക്രമീകരണങ്ങൾ", href: "/settings", icon: Settings },
  ],
}

export function DashboardSidebar({ language }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const items = navigationItems[language] || navigationItems.en

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
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8 p-0">
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    isCollapsed && "justify-center px-2",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
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

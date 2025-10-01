"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LanguageToggle } from "@/components/language-toggle"
import { ModeToggle } from "@/components/mode-toggle"
import { Home, FileText, Camera, Search, Bell, User, Menu, Wifi, WifiOff, Send as Sync, Shield } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface MobileLayoutProps {
  children: React.ReactNode
  language: "en" | "ml"
  onLanguageChange: (language: "en" | "ml") => void
}

const mobileNavItems = {
  en: [
    { name: "Home", href: "/mobile", icon: Home },
    { name: "Documents", href: "/mobile/documents", icon: FileText, badge: "12" },
    { name: "Camera", href: "/mobile/camera", icon: Camera },
    { name: "Search", href: "/mobile/search", icon: Search },
    { name: "Profile", href: "/mobile/profile", icon: User },
  ],
  ml: [
    { name: "ഹോം", href: "/mobile", icon: Home },
    { name: "രേഖകൾ", href: "/mobile/documents", icon: FileText, badge: "12" },
    { name: "ക്യാമറ", href: "/mobile/camera", icon: Camera },
    { name: "തിരയൽ", href: "/mobile/search", icon: Search },
    { name: "പ്രൊഫൈൽ", href: "/mobile/profile", icon: User },
  ],
}

export function MobileLayout({ children, language, onLanguageChange }: MobileLayoutProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSyncCount, setPendingSyncCount] = useState(3)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const navItems = mobileNavItems[language]

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleSync = () => {
    // TODO: Implement sync functionality
    console.log("Syncing data...")
    setPendingSyncCount(0)
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-background border-b border-border sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">KMRL</span>
                    <span className="text-sm text-muted-foreground">
                      {language === "en" ? "Document Assistant" : "രേഖ സഹായി"}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 p-4">
                  <div className="space-y-2">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className="w-full justify-start gap-3 h-12"
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="flex-1 text-left">{item.name}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto">
                                {item.badge}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      )
                    })}
                  </div>
                </nav>

                {/* Menu Footer */}
                <div className="p-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <LanguageToggle currentLanguage={language} onLanguageChange={onLanguageChange} />
                    <ModeToggle />
                  </div>

                  {/* Sync Status */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      {isOnline ? (
                        <Wifi className="h-4 w-4 text-green-600" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">
                        {isOnline ? (language === "en" ? "Online" : "ഓൺലൈൻ") : language === "en" ? "Offline" : "ഓഫ്‌ലൈൻ"}
                      </span>
                    </div>
                    {pendingSyncCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={handleSync}>
                        <Sync className="h-4 w-4 mr-1" />
                        <span className="text-xs">{pendingSyncCount}</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">KMRL</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground">
              5
            </span>
          </Button>

          {/* Profile */}
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Bottom Navigation */}
      <nav className="flex items-center justify-around px-2 py-2 bg-background border-t border-border sticky bottom-0 z-50">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col items-center gap-1 h-16 w-full rounded-lg",
                  isActive && "bg-primary/10 text-primary",
                )}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 h-4 w-4 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </Button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

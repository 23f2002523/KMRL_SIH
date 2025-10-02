"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import { ModeToggle } from "@/components/mode-toggle"
import { HighContrastToggle } from "@/components/high-contrast-toggle"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/hooks/use-auth"
import { Search, Bell, User, LogOut, Settings, Shield, Crown, Eye } from "lucide-react"

export function DashboardHeader() {
  const { language, t } = useLanguage()
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return <Crown className="h-3 w-3" />
      case 'Operator': return <Shield className="h-3 w-3" />
      case 'Viewer': return <Eye className="h-3 w-3" />
      default: return <User className="h-3 w-3" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'Operator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Viewer': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        <div className="mr-4 hidden md:flex">
          <div className="mr-6 flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-teal-600 text-white text-xs font-bold">
              K
            </div>
            <span className="hidden font-bold sm:inline-block text-teal-600 dark:text-teal-400">
              KMRL-SIH 2025
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('nav.search', language)}
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                3
              </span>
            </Button>

            <ModeToggle />
            <HighContrastToggle />

            <div className="relative" ref={dropdownRef}>
              <div 
                className="relative h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-center"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Profile clicked, current state:', dropdownOpen)
                  console.log('Click event triggered')
                  setDropdownOpen(prev => {
                    console.log('Setting dropdown to:', !prev)
                    return !prev
                  })
                }}
                onMouseDown={(e) => {
                  console.log('Mouse down event')
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setDropdownOpen(!dropdownOpen)
                  }
                }}
              >
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300 text-sm font-semibold">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Debug indicator */}
              <div className="absolute -top-2 -right-2 text-xs bg-red-500 text-white px-1 rounded">
                {dropdownOpen ? 'OPEN' : 'CLOSED'}
              </div>
              
              {dropdownOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[9999] py-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                        {user?.email || 'user@example.com'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${getRoleBadgeColor(user?.role || 'Viewer')}`}>
                          <span className="flex items-center gap-1">
                            {getRoleIcon(user?.role || 'Viewer')}
                            {user?.role || 'Viewer'}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        console.log('Settings clicked')
                        setDropdownOpen(false)
                      }}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </button>
                    
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        console.log('Logout clicked')
                        setDropdownOpen(false)
                        handleLogout()
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

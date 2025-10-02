"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { 
  Search, 
  Menu,
  User,
  Settings,
  LogOut,
  Bell,
  Sun,
  Moon,
  Monitor,
  Contrast,
  Crown,
  Shield,
  Eye,
  FileText,
  Brain,
  BarChart3
} from "lucide-react"
import { useTheme } from "next-themes"
import { useHighContrast } from "@/hooks/use-high-contrast"
import { useAuth } from "@/hooks/use-auth"
import { QuickAccessDropdown } from "@/components/quick-access-dropdown"

interface TopHeaderProps {
  onMenuToggle: () => void
  alertCount?: number
}

const navigationItems = [
  { name: "Trainset Overview", href: "/overview" },
  { name: "Induction Plan", href: "/plan" },
  { name: "Simulation Plan", href: "/simulation" },
  { name: "Alerts & Notifications", href: "/alerts" }
]

export function TopHeader({ onMenuToggle, alertCount = 0 }: TopHeaderProps) {
  const [commandOpen, setCommandOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [mounted, setMounted] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  const { isHighContrast, toggleHighContrast } = useHighContrast()
  const [language, setLanguage] = useState('en')
  const { user, logout } = useAuth()
  
  // Simple translation function
  const t = (key: string, fallback?: string) => fallback || key
  const router = useRouter()
  const currentDate = new Date()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [dropdownOpen])

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
      <a href="#main-content" className="skip-link">{t('accessibility.skipToContent')}</a>
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-teal border-b border-teal-primary/20 shadow-teal-lg backdrop-blur-sm"
        role="banner"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left Section - Hamburger + Logo */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="p-2 text-white hover:bg-white/20 hover:text-white transition-all duration-200 navbar-glow"
              aria-label="Toggle navigation menu"
              aria-expanded={false}
              aria-controls="navigation-menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
            
            <div className="hidden md:flex items-center space-x-2 navbar-glow rounded-lg px-2 py-1">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30" aria-hidden="true">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white" aria-label="Kochi Metro Rail Limited">KMRL</h1>
              </div>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-md mx-4" role="search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" aria-hidden="true" />
              <Input
                placeholder={`${t('nav.search')} (Ctrl+K)`}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClick={() => setCommandOpen(true)}
                className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/70 focus:bg-white/20 focus:border-white/40 transition-all duration-200 navbar-glow"
                readOnly
                aria-label={t('nav.search')}
                role="searchbox"
                aria-describedby="search-help"
              />
              <div id="search-help" className="sr-only">{t('nav.searchHelp')}</div>
            </div>
          </div>

          {/* Right Section - Date + Notifications + Profile */}
          <div className="flex items-center space-x-4">
            {/* Current Date */}
            {mounted && (
              <div className="hidden md:block text-sm text-white/90" aria-label={`Current date: ${format(currentDate, 'EEEE, MMMM dd, yyyy')}`}>
                <div className="text-right">
                  <div className="font-medium">
                    {format(currentDate, 'MMM dd, yyyy')}
                  </div>
                  <div className="text-xs text-white/70">
                    {format(currentDate, 'EEEE')}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative p-2 text-white hover:bg-white/20 hover:text-white transition-all duration-200 navbar-glow"
              aria-label={`Notifications ${alertCount > 0 ? `(${alertCount} unread)` : '(no unread notifications)'}`}
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {alertCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg"
                  aria-label={`${alertCount} unread notifications`}
                >
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </Button>

            {/* Quick Access Dropdown */}
            <QuickAccessDropdown user={user} />

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
              className="px-3 py-2 text-white hover:bg-white/20 hover:text-white transition-all duration-200 navbar-glow font-medium"
              title={`Current language: ${language === 'en' ? 'English' : 'മലയാളം'}. Click to switch.`}
              aria-label={`Switch to ${language === 'en' ? 'Malayalam' : 'English'}`}
            >
              {language === 'en' ? 'മലയാളം' : 'ENG'}
            </Button>

            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={cycleTheme}
                className="p-2 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
                title={`Current theme: ${theme}. Click to cycle.`}
              >
                <ThemeIcon className="h-5 w-5" />
              </Button>
            )}

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div 
                className="relative h-10 w-10 rounded-full hover:bg-white/20 cursor-pointer flex items-center justify-center transition-all duration-200"
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
                <Avatar className="h-10 w-10 border-2 border-white/30">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback className="bg-white/20 text-white">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {dropdownOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[9999] py-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
                        KMRL Admin
                      </p>
                      <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                        admin@kmrl.co.in
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
                          Admin
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        console.log('Profile clicked')
                        setDropdownOpen(false)
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </button>
                    
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
                        console.log('High contrast toggled')
                        setDropdownOpen(false)
                        toggleHighContrast()
                      }}
                    >
                      <Contrast className="mr-2 h-4 w-4" />
                      <span>{isHighContrast ? 'Disable' : 'Enable'} High Contrast</span>
                    </button>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        console.log('Logout clicked')
                        setDropdownOpen(false)
                        // Clear authentication state
                        logout()
                        // Force redirect to login page
                        router.push('/login')
                        // Fallback: force page reload to login
                        setTimeout(() => {
                          window.location.href = '/login'
                        }, 100)
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Command Dialog for Global Search */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search navigation, trainsets, alerts..." />
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
            <CommandItem onSelect={() => {
              setCommandOpen(false)
              window.location.href = '/alerts'
            }}>
              <Bell className="mr-2 h-4 w-4" />
              <span>View Alerts ({alertCount})</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

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
    </>
  )
}
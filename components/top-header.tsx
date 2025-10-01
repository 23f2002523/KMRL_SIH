"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Contrast
} from "lucide-react"
import { useTheme } from "next-themes"
import { useHighContrast } from "@/hooks/use-high-contrast"
import { useLanguage } from "@/hooks/use-language"

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
  const { theme, setTheme } = useTheme()
  const { isHighContrast, toggleHighContrast } = useHighContrast()
  const { language, setLanguage, t } = useLanguage()
  const currentDate = new Date()

  useEffect(() => {
    setMounted(true)
  }, [])

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/20 transition-all duration-200">
                  <Avatar className="h-10 w-10 border-2 border-white/30">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback className="bg-white/20 text-white">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">KMRL Admin</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      admin@kmrl.co.in
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleHighContrast}>
                  <Contrast className="mr-2 h-4 w-4" />
                  <span>{isHighContrast ? 'Disable' : 'Enable'} High Contrast</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
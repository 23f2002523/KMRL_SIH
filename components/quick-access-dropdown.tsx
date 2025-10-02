"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Crown, 
  Shield, 
  Eye, 
  Bell,
  ChevronDown
} from "lucide-react"

interface MenuItem {
  icon?: any
  label?: string
  path?: string
  divider?: boolean
}

interface QuickAccessDropdownProps {
  user: any
}

export function QuickAccessDropdown({ user }: QuickAccessDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  const menuItems = [
    ...(user?.role === 'Admin' ? [
      { icon: Crown, label: 'Admin Dashboard', path: '/admin' },
      { icon: Shield, label: 'User Management', path: '/admin/users' },
      { divider: true }
    ] : []),
    { icon: Eye, label: 'RBAC Demo', path: '/rbac-demo' },
    { icon: Bell, label: 'Error Testing', path: '/error-test' },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-white hover:bg-white/20 hover:text-white transition-all duration-200 navbar-glow font-medium rounded-md flex items-center gap-2"
        aria-label="Quick access menu"
      >
        Quick Access
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Quick Access</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Navigate to key features</p>
          </div>
          
          <div className="py-1">
            {menuItems.map((item, index) => {
              if (item.divider) {
                return <div key={index} className="my-1 border-t border-gray-200 dark:border-gray-700" />
              }
              
              if (!item.path || !item.icon || !item.label) return null
              
              const Icon = item.icon
              return (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.path!)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
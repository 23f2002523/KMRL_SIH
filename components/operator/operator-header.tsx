"use client"

import { Menu, Transition } from '@headlessui/react'
import { BellIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ModeToggle } from '@/components/mode-toggle'
import { LibreLanguageToggle } from '@/components/language/libre-language-toggle'
import { TranslatedText } from '@/components/translation/libre-translated-text'
import { GlobalSearchBox } from '@/components/operator/global-search-box'

interface OperatorHeaderProps {
  user: any
  isSidebarExpanded?: boolean
}

export function OperatorHeader({ user, isSidebarExpanded = false }: OperatorHeaderProps) {
  const { logout } = useAuth()

  return (
    <div 
      className={`fixed top-0 right-0 left-0 z-[60] flex h-20 shrink-0 items-center justify-between border-b border-green-200/30 dark:border-green-700/30 bg-gradient-to-r from-white/95 to-green-50/95 dark:from-gray-800/95 dark:to-green-900/95 backdrop-blur-md px-4 shadow-sm sm:px-6 lg:px-8 transition-all duration-300 ${
        isSidebarExpanded ? 'lg:left-64' : 'lg:left-16'
      }`}
    >
      {/* Left side - Page Title */}
      <div className="flex items-center min-w-0">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
          <TranslatedText text="MetroMind AI" />
        </h1>
      </div>
      
      {/* Center - Search Box */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <GlobalSearchBox />
      </div>
      
      {/* Right side controls */}
      <div className="flex items-center gap-x-2 sm:gap-x-4">
        {/* Language Toggle - Hidden on mobile */}
        <div className="hidden sm:block">
          <LibreLanguageToggle />
        </div>
        
        {/* Theme Toggle */}
        <ModeToggle />
        
        {/* Separator */}
        <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-600" aria-hidden="true" />
        {/* Profile dropdown */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-x-1 rounded-md bg-white dark:bg-gray-800 px-2 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <UserCircleIcon className="h-6 w-6 text-gray-400 dark:text-gray-300" />
            <ChevronDownIcon className="h-3 w-3 text-gray-400 dark:text-gray-300" />
          </Menu.Button>
          
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              
              <Menu.Item>
                {({ active }) => (
                  <div className={cn(
                    active ? 'bg-gray-50 dark:bg-gray-700' : '',
                    'px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                  )}>
                    <span className="font-medium">Role: </span>
                    <Badge variant="outline" className="ml-1">
                      {user?.role || 'Operator'}
                    </Badge>
                  </div>
                )}
              </Menu.Item>
              
              <div className="border-t border-gray-100 dark:border-gray-700">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={cn(
                        active ? 'bg-gray-50 dark:bg-gray-700' : '',
                        'block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                    >
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  )
}
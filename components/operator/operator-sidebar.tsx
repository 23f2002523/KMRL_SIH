"use client"

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Train, BarChart3, AlertTriangle, FileText, Clock, Users, Upload, Menu, Brain, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useLanguage } from '@/hooks/use-libre-translate'
import { TranslatedText } from '@/components/translation/libre-translated-text'

// Navigation will be created dynamically in component to use translations

interface OperatorSidebarProps {
  onSidebarChange?: (isExpanded: boolean) => void
}

export function OperatorSidebar({ onSidebarChange }: OperatorSidebarProps) {
  const pathname = usePathname()
  const { } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)
  const [open, setOpen] = useState(false)

  const operatorNavigation = [
    { nameKey: 'Dashboard', href: '/operator/dashboard', icon: BarChart3, current: true },
    { nameKey: 'Upload', href: '/operator/upload', icon: Upload, current: false },
    { nameKey: 'AI Insights', href: '/operator/trains', icon: Brain, current: false },
    { nameKey: 'Alerts', href: '/operator/alerts', icon: AlertTriangle, current: false },
    { nameKey: 'Simulation', href: '/operator/schedule', icon: TrendingUp, current: false },
    { nameKey: 'Reports', href: '/operator/reports', icon: FileText, current: false },
  ]

  const handleExpansionChange = (expanded: boolean) => {
    setIsExpanded(expanded)
    onSidebarChange?.(expanded)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Hamburger Sidebar */}
      <div 
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-gradient-to-b from-white/95 to-green-50/95 dark:from-gray-800/95 dark:to-green-900/95 backdrop-blur-md shadow-lg transition-all duration-300",
          isExpanded ? "w-64" : "w-16"
        )}
        onMouseEnter={() => handleExpansionChange(true)}
        onMouseLeave={() => handleExpansionChange(false)}
      >
        {/* Logo Header */}
        <div className="flex h-16 items-center px-4 border-b border-green-200/30 dark:border-green-700/30">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-gray-700 border border-green-200 dark:border-green-600 shadow-sm">
              <Image 
                src="/logo.jpg" 
                alt="MetroMind AI Logo" 
                width={24} 
                height={24} 
                className="rounded-sm"
              />
            </div>
            {isExpanded && (
              <span className="text-lg font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                MetroMind AI
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {operatorNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.nameKey}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group",
                  isActive
                    ? "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400"
                )}
              >
                <item.icon 
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400"
                  )} 
                />
                  {isExpanded && (
                    <span className="font-medium whitespace-nowrap">
                      <TranslatedText text={item.nameKey} />
                    </span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      <TranslatedText text={item.nameKey} />
                    </div>
                  )}
                </Link>
            )
          })}
        </nav>


      </div>

      {/* Mobile overlay */}
      <div className="lg:hidden">
        <MobileSidebar operatorNavigation={operatorNavigation} />
      </div>
    </div>
  )
}

// Mobile sidebar component
interface MobileSidebarProps {
  operatorNavigation: Array<{
    nameKey: string;
    href: string;
    icon: any;
    current: boolean;
  }>;
}

function MobileSidebar({ operatorNavigation }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          type="button"
          className="p-2 rounded-md bg-white shadow-md border border-gray-200"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
                        <Train className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-bold text-green-600">KMRL Operations</span>
                    </div>
                  </div>
                  
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {operatorNavigation.map((item) => (
                            <li key={item.nameKey}>
                              <Link
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                  pathname === item.href
                                    ? 'bg-green-50 text-green-600'
                                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50',
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                )}
                              >
                                <item.icon
                                  className={cn(
                                    pathname === item.href ? 'text-green-600' : 'text-gray-400 group-hover:text-green-600',
                                    'h-6 w-6 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                <TranslatedText text={item.nameKey} />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
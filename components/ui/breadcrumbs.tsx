"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/hooks/use-language"

interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname()
  const { t } = useLanguage()

  // Auto-generate breadcrumbs based on pathname if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: t('nav.home', 'Home'), href: '/overview' }
    ]

    const pathMap: Record<string, string> = {
      'overview': t('nav.overview', 'Overview'),
      'alerts': t('nav.notifications', 'Alerts & Notifications'),
      'plan': t('nav.inductionPlan', 'Induction Plan'),
      'simulation': t('nav.simulationPlan', 'Simulation Panel'),
      'trainset': t('nav.trainsetDetails', 'Trainset Details'),
      'details': t('nav.details', 'Details'),
      'documents': t('nav.documents', 'Documents'),
      'upload': t('nav.upload', 'Upload'),
      'users': t('nav.users', 'Users'),
      'settings': t('nav.settings', 'Settings'),
      'analytics': t('nav.analytics', 'Analytics'),
      'archive': t('nav.archive', 'Archive'),
      'workflow': t('nav.workflow', 'Workflow'),
      'ai-chat': t('nav.aiChat', 'AI Chat'),
      'mobile': t('nav.mobile', 'Mobile')
    }

    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1
      
      breadcrumbs.push({
        label: pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? undefined : currentPath,
        isActive: isLast
      })
    })

    return breadcrumbs
  }

  const breadcrumbItems = items || generateBreadcrumbs()

  if (breadcrumbItems.length <= 1) {
    return null
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1 text-sm text-gray-500", className)}
    >
      <Home className="h-4 w-4" />
      
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          
          {item.href && !item.isActive ? (
            <Link
              href={item.href}
              className="hover:text-gray-700 transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                item.isActive ? "text-gray-900 font-medium" : "text-gray-500"
              )}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
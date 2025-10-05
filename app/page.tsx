"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading, user } = useAuth()
  const error = searchParams.get('error')

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Role-based redirect for authenticated users
        // Always redirect to operator dashboard since we only have operator sections now
        router.replace("/operator/dashboard")
      } else {
        // Redirect unauthenticated users to login
        router.replace("/login")
      }
    }
  }, [router, isAuthenticated, isLoading, user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-teal-soft dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" label="Loading KMRL System..." />
          <p className="mt-4 text-teal-primary font-medium">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-teal-soft dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-4">
        {error === 'unauthorized' && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              You don't have permission to access that page. Please check your role permissions.
            </AlertDescription>
          </Alert>
        )}
        
        <LoadingSpinner size="lg" label="Redirecting..." />
        <p className="mt-4 text-teal-primary font-medium">
          {isAuthenticated ? "Loading KMRL Dashboard..." : "Redirecting to login..."}
        </p>
      </div>
    </div>
  )
}

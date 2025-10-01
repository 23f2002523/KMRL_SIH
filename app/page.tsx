"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to overview page immediately
    router.replace("/overview")
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-teal-soft dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" label="Redirecting to KMRL Train Overview..." />
        <p className="mt-4 text-teal-primary font-medium">Loading KMRL Dashboard...</p>
      </div>
    </div>
  )
}

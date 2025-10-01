import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Table Skeleton
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[90px]" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[90px]" />
        </div>
      ))}
    </div>
  )
}

// Card Skeleton
function CardSkeleton() {
  return (
    <div className="p-6 space-y-3">
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

// Metrics Cards Skeleton
function MetricsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg">
          <div className="flex items-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="ml-4 space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-6 w-[60px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Dashboard Skeleton
function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <Skeleton className="h-8 w-[250px] mb-2" />
        <Skeleton className="h-4 w-[400px]" />
      </div>

      {/* Metrics Cards */}
      <MetricsCardsSkeleton />

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          <div className="border rounded-lg">
            <div className="p-6 border-b">
              <Skeleton className="h-6 w-[200px]" />
            </div>
            <div className="p-6">
              <TableSkeleton />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="border rounded-lg">
            <CardSkeleton />
          </div>
          <div className="border rounded-lg">
            <CardSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}

export { 
  Skeleton, 
  TableSkeleton, 
  CardSkeleton, 
  MetricsCardsSkeleton, 
  DashboardSkeleton 
}
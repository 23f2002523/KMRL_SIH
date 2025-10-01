"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  RefreshCw, 
  Search, 
  Filter,
  Train,
  MapPin,
  Calendar,
  Wrench
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useLanguage } from "@/hooks/use-language"

interface Trainset {
  id: number
  serialNumber: string
  modelType: string
  manufacturer: string
  yearManufactured: number
  currentLocation: string
  status: 'active' | 'maintenance' | 'reserve' | 'inactive'
  lastInspection?: Date
  nextInspection?: Date
  totalDistance?: number
  operationalHours?: number
}

interface TrainStatusTableProps {
  trainsets: Trainset[]
  onRefresh: () => void
  loading?: boolean
}

function getStatusBadge(status: 'active' | 'maintenance' | 'reserve' | 'inactive', t: (key: string, fallback?: string) => string) {
  const statusConfig = {
    active: "bg-green-100 text-green-800 border-green-200",
    maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200", 
    reserve: "bg-blue-100 text-blue-800 border-blue-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200"
  }

  const statusLabels = {
    active: t('stats.active', 'Active'),
    maintenance: t('stats.maintenance', 'Maintenance'),
    reserve: t('stats.reserve', 'Reserve'),
    inactive: t('stats.inactive', 'Inactive')
  }
  
  return (
    <Badge variant="outline" className={statusConfig[status]}>
      {statusLabels[status]}
    </Badge>
  )
}

function getStatusIcon(status: 'active' | 'maintenance' | 'reserve' | 'inactive') {
  const iconClass = "h-4 w-4 mr-2"
  
  switch (status) {
    case 'active':
      return <Train className={`${iconClass} text-green-600`} />
    case 'maintenance':
      return <Wrench className={`${iconClass} text-yellow-600`} />
    case 'reserve':
      return <MapPin className={`${iconClass} text-blue-600`} />
    case 'inactive':
      return <Calendar className={`${iconClass} text-gray-600`} />
  }
}

export function TrainStatusTable({ trainsets, onRefresh, loading }: TrainStatusTableProps) {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("serialNumber")

  // Filter and sort trainsets
  const filteredTrainsets = trainsets
    .filter(trainset => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = (trainset.serialNumber?.toLowerCase() || '').includes(searchLower) ||
                           (trainset.modelType?.toLowerCase() || '').includes(searchLower) ||
                           (trainset.currentLocation?.toLowerCase() || '').includes(searchLower)
      
      const matchesStatus = statusFilter === "all" || trainset.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "serialNumber":
          return (a.serialNumber || '').localeCompare(b.serialNumber || '')
        case "status":
          return (a.status || '').localeCompare(b.status || '')
        case "location":
          return (a.currentLocation || '').localeCompare(b.currentLocation || '')
        case "year":
          return (b.yearManufactured || 0) - (a.yearManufactured || 0)
        default:
          return 0
      }
    })

  const statusCounts = {
    active: trainsets.filter(t => t.status === 'active').length,
    maintenance: trainsets.filter(t => t.status === 'maintenance').length,
    reserve: trainsets.filter(t => t.status === 'reserve').length,
    inactive: trainsets.filter(t => t.status === 'inactive').length
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Train className="h-5 w-5 text-blue-600" />
            <span>{t('dashboard.trainsetStatusOverview', 'Trainset Status Overview')}</span>
            <Badge variant="outline" className="ml-2">
              {trainsets.length} {t('stats.total', 'Total')}
            </Badge>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn("h-3 w-3 mr-1", loading && "animate-spin")} />
            {t('common.refresh', 'Refresh')}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Status Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {statusCounts.active}
            </div>
            <div className="text-sm text-gray-600">{t('stats.active', 'Active')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">
              {statusCounts.maintenance}
            </div>
            <div className="text-sm text-gray-600">{t('stats.maintenance', 'Maintenance')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {statusCounts.reserve}
            </div>
            <div className="text-sm text-gray-600">{t('stats.reserve', 'Reserve')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-600">
              {statusCounts.inactive}
            </div>
            <div className="text-sm text-gray-600">{t('stats.inactive', 'Inactive')}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder={t('dashboard.searchTrainsets', 'Search by serial number, model, or location...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.allStatus', 'All Status')}</SelectItem>
              <SelectItem value="active">{t('stats.active', 'Active')}</SelectItem>
              <SelectItem value="maintenance">{t('stats.maintenance', 'Maintenance')}</SelectItem>
              <SelectItem value="reserve">{t('stats.reserve', 'Reserve')}</SelectItem>
              <SelectItem value="inactive">{t('stats.inactive', 'Inactive')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="serialNumber">Serial Number</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="location">Location</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Trainsets Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">{t('dashboard.serialNo', 'Serial No.')}</TableHead>
                <TableHead>{t('dashboard.modelType', 'Model Type')}</TableHead>
                <TableHead>{t('documents.status', 'Status')}</TableHead>
                <TableHead>{t('dashboard.location', 'Location')}</TableHead>
                <TableHead>{t('dashboard.lastInspection', 'Last Inspection')}</TableHead>
                <TableHead>{t('dashboard.nextInspection', 'Next Inspection')}</TableHead>
                <TableHead className="text-right">{t('dashboard.distance', 'Distance (km)')}</TableHead>
                <TableHead className="text-right">{t('dashboard.hours', 'Hours')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrainsets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-gray-500">
                      {searchTerm || statusFilter !== "all" 
                        ? "No trainsets match your filters" 
                        : "No trainsets available"
                      }
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrainsets.map((trainset) => (
                  <TableRow key={trainset.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono font-medium">
                      {trainset.serialNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{trainset.modelType}</div>
                        <div className="text-sm text-gray-500">
                          {trainset.manufacturer} ({trainset.yearManufactured})
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(trainset.status)}
                        {getStatusBadge(trainset.status, t)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                        {trainset.currentLocation}
                      </div>
                    </TableCell>
                    <TableCell>
                      {trainset.lastInspection ? (
                        <span className="text-sm">
                          {format(trainset.lastInspection, 'MMM dd, yyyy')}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not available</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {trainset.nextInspection ? (
                        <span className={cn(
                          "text-sm",
                          trainset.nextInspection < new Date() 
                            ? "text-red-600 font-medium" 
                            : "text-gray-900"
                        )}>
                          {format(trainset.nextInspection, 'MMM dd, yyyy')}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {trainset.totalDistance ? (
                        <span className="font-mono">
                          {trainset.totalDistance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {trainset.operationalHours ? (
                        <span className="font-mono">
                          {trainset.operationalHours.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredTrainsets.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
            <div>
              Showing {filteredTrainsets.length} of {trainsets.length} trainsets
            </div>
            <div>
              Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
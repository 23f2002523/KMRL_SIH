"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Clock, Wrench, MapPin, Droplets } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrainsetData {
  trainsetId: number
  serialNo: string
  status: "Active" | "Standby" | "Maintenance"
  fitnessCertificates: {
    rollingStock: "Valid" | "Expired" | "Pending"
    signalling: "Valid" | "Expired" | "Pending"
    telecom: "Valid" | "Expired" | "Pending"
  }
  jobCards: {
    open: number
    closed: number
  }
  brandingHours: {
    consumed: number
    allocated: number
  }
  mileageKm: number
  cleaningStatus: "Done" | "Pending" | "InProgress"
  depot: {
    depot: string
    bayNo: number
    position: number
  }
  lastServiceDate: string
}

interface TrainsetStatusTableProps {
  trainsets: TrainsetData[]
  isLoading?: boolean
}

function getStatusBadge(status: "Active" | "Standby" | "Maintenance") {
  const statusConfig = {
    Active: { color: "bg-green-100 text-green-800", text: "Service" },
    Standby: { color: "bg-yellow-100 text-yellow-800", text: "Standby" },
    Maintenance: { color: "bg-red-100 text-red-800", text: "Maintenance" },
  }
  
  const config = statusConfig[status]
  return (
    <Badge className={config.color}>
      {config.text}
    </Badge>
  )
}

function getFitnessIcon(status: "Valid" | "Expired" | "Pending") {
  switch (status) {
    case "Valid":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "Expired":
      return <XCircle className="h-4 w-4 text-red-600" />
    case "Pending":
      return <Clock className="h-4 w-4 text-yellow-600" />
  }
}

function getCleaningStatusBadge(status: "Done" | "Pending" | "InProgress") {
  const statusConfig = {
    Done: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3" /> },
    Pending: { color: "bg-red-100 text-red-800", icon: <Clock className="h-3 w-3" /> },
    InProgress: { color: "bg-blue-100 text-blue-800", icon: <Droplets className="h-3 w-3" /> },  
  }
  
  const config = statusConfig[status]
  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      {config.icon}
      {status}
    </Badge>
  )
}

function getBrandingProgress(consumed: number, allocated: number) {
  const percentage = allocated > 0 ? (consumed / allocated) * 100 : 0
  let colorClass = "text-green-600"
  
  if (percentage < 50) colorClass = "text-red-600"
  else if (percentage < 80) colorClass = "text-yellow-600"
  
  return (
    <div className="flex flex-col">
      <span className={`text-sm font-medium ${colorClass}`}>
        {consumed}/{allocated} hrs
      </span>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
        <div 
          className={`h-1.5 rounded-full ${
            percentage < 50 ? 'bg-red-500' : 
            percentage < 80 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}

export function TrainsetStatusTable({ trainsets, isLoading = false }: TrainsetStatusTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trainset Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Trainset Status Overview</span>
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trainset ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fitness Certificate</TableHead>
                <TableHead>Job Cards</TableHead>
                <TableHead>Branding Hours</TableHead>
                <TableHead>Mileage (km)</TableHead>
                <TableHead>Cleaning Status</TableHead>
                <TableHead>Depot + Bay</TableHead>
                <TableHead>Last Service</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainsets.map((trainset) => (
                <TableRow key={trainset.trainsetId} className="hover:bg-gray-50">
                  {/* Trainset ID */}
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-bold text-blue-600">
                          {trainset.serialNo}
                        </span>
                      </div>
                      #{trainset.trainsetId}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {getStatusBadge(trainset.status)}
                  </TableCell>

                  {/* Fitness Certificate */}
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1">
                          {getFitnessIcon(trainset.fitnessCertificates.rollingStock)}
                          <span className="text-xs">RS</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getFitnessIcon(trainset.fitnessCertificates.signalling)}
                          <span className="text-xs">SIG</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getFitnessIcon(trainset.fitnessCertificates.telecom)}
                          <span className="text-xs">TEL</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Job Cards */}
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          Open: {trainset.jobCards.open}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          Closed: {trainset.jobCards.closed}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  {/* Branding Hours */}
                  <TableCell>
                    {getBrandingProgress(trainset.brandingHours.consumed, trainset.brandingHours.allocated)}
                  </TableCell>

                  {/* Mileage */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={cn(
                        "font-medium",
                        trainset.mileageKm > 20000 ? "text-red-600" :
                        trainset.mileageKm > 15000 ? "text-yellow-600" : "text-green-600"
                      )}>
                        {trainset.mileageKm.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">km</span>
                    </div>
                  </TableCell>

                  {/* Cleaning Status */}
                  <TableCell>
                    {getCleaningStatusBadge(trainset.cleaningStatus)}
                  </TableCell>

                  {/* Depot + Bay */}
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span className="text-sm">
                        {trainset.depot.depot}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Bay {trainset.depot.bayNo} • Pos {trainset.depot.position}
                    </div>
                  </TableCell>

                  {/* Last Service */}
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {new Date(trainset.lastServiceDate).toLocaleDateString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
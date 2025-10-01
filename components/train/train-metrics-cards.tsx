"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Train, CheckCircle, Clock, Wrench, AlertTriangle } from "lucide-react"

interface MetricCardProps {
  title: string
  value: number
  icon: React.ReactNode
  bgColor: string
  textColor: string
  badgeColor?: string
}

function MetricCard({ title, value, icon, bgColor, textColor, badgeColor }: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-full ${bgColor}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className={`text-2xl font-bold ${textColor}`}>
            {value}
          </div>
          {badgeColor && (
            <Badge className={`${badgeColor} text-white`}>
              Active
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface TrainMetricsCardsProps {
  metrics: {
    totalTrainsets: number
    readyForService: number
    standby: number
    maintenance: number
    alerts: number
  }
}

export function TrainMetricsCards({ metrics }: TrainMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4">
      {/* Total Trainsets */}
      <MetricCard
        title="Total Trainsets"
        value={metrics.totalTrainsets}
        icon={<Train className="h-4 w-4 text-blue-600" />}
        bgColor="bg-blue-100"
        textColor="text-blue-600"
      />

      {/* Ready for Service */}
      <MetricCard
        title="Ready for Service"
        value={metrics.readyForService}
        icon={<CheckCircle className="h-4 w-4 text-green-600" />}
        bgColor="bg-green-100"
        textColor="text-green-600"
        badgeColor="bg-green-500"
      />

      {/* Standby */}
      <MetricCard
        title="Standby"
        value={metrics.standby}
        icon={<Clock className="h-4 w-4 text-yellow-600" />}
        bgColor="bg-yellow-100"
        textColor="text-yellow-600"
        badgeColor="bg-yellow-500"
      />

      {/* Maintenance */}
      <MetricCard
        title="Maintenance"
        value={metrics.maintenance}
        icon={<Wrench className="h-4 w-4 text-red-600" />}
        bgColor="bg-red-100"
        textColor="text-red-600"
        badgeColor="bg-red-500"
      />

      {/* Alerts */}
      <MetricCard
        title="Alerts"
        value={metrics.alerts}
        icon={<AlertTriangle className="h-4 w-4 text-orange-600" />}
        bgColor="bg-orange-100"
        textColor="text-orange-600"
        badgeColor="bg-orange-500"
      />
    </div>
  )
}
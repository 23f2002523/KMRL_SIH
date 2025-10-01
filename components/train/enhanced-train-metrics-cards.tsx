"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { TrendingUp, TrendingDown, Train, Wrench, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/hooks/use-language"

interface Metrics {
  totalTrainsets: number
  readyForService: number
  standby: number
  maintenance: number
  alerts: number
}

interface EnhancedTrainMetricsCardsProps {
  metrics: Metrics
  showCharts?: boolean
  className?: string
}

const COLORS = {
  readyForService: '#10b981', // green-500
  standby: '#3b82f6',         // blue-500
  maintenance: '#f59e0b',     // amber-500
  alerts: '#ef4444'           // red-500
}

export function EnhancedTrainMetricsCards({ 
  metrics, 
  showCharts = true, 
  className 
}: EnhancedTrainMetricsCardsProps) {
  const { t } = useLanguage()

  // Data for pie chart
  const pieData = [
    { name: t('stats.readyForService', 'Ready for Service'), value: metrics.readyForService, color: COLORS.readyForService },
    { name: t('stats.standby', 'Standby'), value: metrics.standby, color: COLORS.standby },
    { name: t('stats.maintenance', 'Maintenance'), value: metrics.maintenance, color: COLORS.maintenance },
  ]

  // Data for bar chart
  const barData = [
    { name: t('stats.service', 'Service'), value: metrics.readyForService, fill: COLORS.readyForService },
    { name: t('stats.standby', 'Standby'), value: metrics.standby, fill: COLORS.standby },
    { name: t('stats.maintenance', 'Maintenance'), value: metrics.maintenance, fill: COLORS.maintenance },
    { name: t('stats.alerts', 'Alerts'), value: metrics.alerts, fill: COLORS.alerts },
  ]

  // Calculate percentages
  const servicePercentage = metrics.totalTrainsets > 0 
    ? Math.round((metrics.readyForService / metrics.totalTrainsets) * 100) 
    : 0
  const efficiencyTrend = servicePercentage >= 70 ? 'up' : 'down'

  const metricCards = [
    {
      title: t('stats.totalTrainsets', 'Total Trainsets'),
      value: metrics.totalTrainsets,
      icon: <Train className="h-6 w-6 text-blue-600" />,
      description: t('stats.fleetSize', 'Fleet size'),
      trend: null,
      color: "blue"
    },
    {
      title: t('stats.readyForService', 'Ready for Service'),
      value: metrics.readyForService,
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      description: `${servicePercentage}% ${t('stats.ofFleet', 'of fleet')}`,
      trend: efficiencyTrend,
      color: "green"
    },
    {
      title: t('stats.standby', 'Standby'),
      value: metrics.standby,
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      description: t('stats.reserveCapacity', 'Reserve capacity'),
      trend: null,
      color: "blue"
    },
    {
      title: t('stats.maintenance', 'Maintenance'),
      value: metrics.maintenance,
      icon: <Wrench className="h-6 w-6 text-yellow-600" />,
      description: t('stats.underService', 'Under service'),
      trend: null,
      color: "yellow"
    },
    {
      title: t('stats.activeAlerts', 'Active Alerts'),
      value: metrics.alerts,
      icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
      description: t('stats.requiresAttention', 'Requires attention'),
      trend: metrics.alerts > 5 ? 'down' : null,
      color: "red"
    }
  ]

  return (
    <div className={cn("space-y-6", className)}>
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {metricCards.map((card, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {card.icon}
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {card.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {card.value}
                      </p>
                      {card.trend && (
                        <div className={cn(
                          "flex items-center",
                          card.trend === 'up' ? "text-green-600" : "text-red-600"
                        )}>
                          {card.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            {/* Background decoration */}
            <div className={cn(
              "absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full",
              card.color === 'blue' && "bg-blue-500",
              card.color === 'green' && "bg-green-500",
              card.color === 'yellow' && "bg-yellow-500",
              card.color === 'red' && "bg-red-500"
            )} />
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('stats.fleetStatusDistribution', 'Fleet Status Distribution')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [value, 'Trainsets']}
                      labelStyle={{ color: '#374151' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart - Status Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('stats.statusOverview', 'Status Overview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [value, 'Count']}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{ 
                        backgroundColor: '#f9fafb', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[4, 4, 0, 0]}
                      fill="#3b82f6"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
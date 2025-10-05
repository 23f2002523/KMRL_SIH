"use client"

import { useAuth } from '@/hooks/use-auth'
import { useState } from 'react'
import { RoleGuard } from '@/hooks/use-role-access'
import { useLanguage } from '@/hooks/use-libre-translate'
import { TranslatedText } from '@/components/translation/libre-translated-text'
import { OperatorSidebar } from '@/components/operator/operator-sidebar'
import { OperatorHeader } from '@/components/operator/operator-header'
import { AnimatedBackground } from '@/components/animated-background'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, RefreshCw, Bell, CheckCircle, Shield, Zap, Calendar, Users, Train } from 'lucide-react'

interface ConflictAlert {
  id: string
  type: 'telecom' | 'branding' | 'resources' | 'maintenance' | 'safety' | 'scheduling'
  severity: 'critical' | 'warning' | 'info'
  trainId?: string
  title: string
  description: string
  impact: string
  detectedAt: string
  status: 'active' | 'acknowledged' | 'overridden' | 'resolved'
  aiConfidence: number
}

export default function OperatorAlertsPage() {
  const { user } = useAuth()
  const { } = useLanguage()
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const [alerts, setAlerts] = useState<ConflictAlert[]>([
    {
      id: 'AL001',
      type: 'telecom',
      severity: 'critical',
      trainId: 'T-104',
      title: 'Missing Telecom Clearance',
      description: 'Train T-104 scheduled for departure but telecom safety clearance not received from control room',
      impact: 'Cannot depart until clearance obtained - may delay 3 connecting services',
      detectedAt: '2025-01-04 14:23',
      status: 'active',
      aiConfidence: 95
    },
    {
      id: 'AL002', 
      type: 'branding',
      severity: 'warning',
      trainId: 'T-115',
      title: 'Branding Contract Breach Risk',
      description: 'T-115 with Coca-Cola branding not scheduled for tonight - contract requires 90% exposure',
      impact: 'Contract penalty ₹50k/day if exposure falls below threshold',
      detectedAt: '2025-01-04 13:45',
      status: 'active',
      aiConfidence: 87
    },
    {
      id: 'AL003',
      type: 'resources',
      severity: 'critical', 
      trainId: undefined,
      title: 'Cleaning Slots Overbooked',
      description: 'Cleaning bay schedule shows 12 jobs allocated vs only 8 available staff members',
      impact: '4 trains may miss cleaning slots - affects service readiness for tomorrow',
      detectedAt: '2025-01-04 12:30',
      status: 'active',
      aiConfidence: 92
    },
    {
      id: 'AL004',
      type: 'maintenance',
      severity: 'critical',
      trainId: 'T-107',
      title: 'Overdue Safety Inspection',
      description: 'T-107 safety inspection expired 3 days ago but still scheduled for passenger service',
      impact: 'Regulatory violation - train must be pulled from service immediately',
      detectedAt: '2025-01-04 09:15',
      status: 'acknowledged',
      aiConfidence: 98
    },
    {
      id: 'AL005',
      type: 'scheduling',
      severity: 'warning',
      trainId: 'T-122',
      title: 'Operator Rest Period Conflict',
      description: 'Operator assigned to T-122 has insufficient rest period between shifts (6h vs required 8h)',
      impact: 'Labor law violation risk - may need replacement operator',
      detectedAt: '2025-01-04 08:00',
      status: 'active',
      aiConfidence: 89
    },
    {
      id: 'AL006',
      type: 'safety',
      severity: 'warning',
      trainId: 'T-101',
      title: 'Weather Impact Alert',
      description: 'Heavy rain forecast may affect T-101 route - reduced visibility conditions expected',
      impact: 'May require speed restrictions or service suspension on affected sectors',
      detectedAt: '2025-01-04 06:30',
      status: 'active',
      aiConfidence: 76
    }
  ])

  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'critical'>('all')
  
  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'acknowledged' }
        : alert
    ))
  }

  const handleOverride = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'overridden' }
        : alert
    ))
  }

  const getFilteredAlerts = () => {
    switch (filter) {
      case 'active':
        return alerts.filter(alert => alert.status === 'active')
      case 'acknowledged':
        return alerts.filter(alert => alert.status === 'acknowledged')
      case 'critical':
        return alerts.filter(alert => alert.severity === 'critical')
      default:
        return alerts.filter(alert => alert.status !== 'resolved')
    }
  }

  const getAlertIcon = (type: ConflictAlert['type']) => {
    switch (type) {
      case 'telecom': return <Zap className="h-5 w-5" />
      case 'branding': return <Badge className="h-5 w-5" />
      case 'resources': return <Users className="h-5 w-5" />
      case 'maintenance': return <Train className="h-5 w-5" />
      case 'safety': return <Shield className="h-5 w-5" />
      case 'scheduling': return <Calendar className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getSeverityColor = (severity: ConflictAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusBadge = (status: ConflictAlert['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive"><TranslatedText text="Active" /></Badge>
      case 'acknowledged':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><TranslatedText text="Acknowledged" /></Badge>
      case 'overridden':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800"><TranslatedText text="Overridden" /></Badge>
      case 'resolved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><TranslatedText text="Resolved" /></Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const stats = {
    total: alerts.filter(a => a.status !== 'resolved').length,
    active: alerts.filter(a => a.status === 'active').length,
    critical: alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length
  }

  const filteredAlerts = getFilteredAlerts()

  return (
    <RoleGuard role="Operator">
      <div className="h-screen relative flex">
        <AnimatedBackground />
        <div className="relative z-10 w-full flex">
        <OperatorSidebar onSidebarChange={setIsSidebarExpanded} />
        
        <div 
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarExpanded ? 'lg:pl-64' : 'lg:pl-16'
          }`}
        >
          <OperatorHeader user={user} isSidebarExpanded={isSidebarExpanded} />
          
          <main className="flex-1 overflow-auto pt-20 p-6 space-y-6">
            <div className="bg-card text-card-foreground overflow-hidden shadow rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                    <TranslatedText text="Conflict Alerts" />
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    <TranslatedText text="AI-detected issues with consolidated operational conflicts" />
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                <TranslatedText text="Refresh Alerts" />
                </Button>
              </div>
            </div>

            {/* Alert Statistics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        <TranslatedText text="Total Alerts" />
                      </p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Bell className="h-8 w-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        <TranslatedText text="Active" />
                      </p>
                      <p className="text-2xl font-bold text-red-600">{stats.active}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        <TranslatedText text="Critical" />
                      </p>
                      <p className="text-2xl font-bold text-red-800">{stats.critical}</p>
                    </div>
                    <Shield className="h-8 w-8 text-red-800" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        <TranslatedText text="Acknowledged" />
                      </p>
                      <p className="text-2xl font-bold text-blue-600">{stats.acknowledged}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('all')}
              >
                <TranslatedText text="All Alerts" />
              </Button>
              <Button 
                variant={filter === 'active' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('active')}
              >
                <TranslatedText text="Active" /> ({stats.active})
              </Button>
              <Button 
                variant={filter === 'critical' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('critical')}
              >
                <TranslatedText text="Critical" /> ({stats.critical})
              </Button>
              <Button 
                variant={filter === 'acknowledged' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('acknowledged')}
              >
                <TranslatedText text="Acknowledged" /> ({stats.acknowledged})
              </Button>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Conflicts</h3>
                    <p className="text-muted-foreground">All systems operating normally</p>
                  </CardContent>
                </Card>
              ) : (
                filteredAlerts.map((alert) => (
                  <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                            {getAlertIcon(alert.type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">
                                {alert.trainId && (
                                  <span className="text-blue-600 mr-2">{alert.trainId}:</span>
                                )}
                                {alert.title}
                              </h3>
                              {getStatusBadge(alert.status)}
                              <Badge variant="outline" className="text-xs">
                                AI {alert.aiConfidence}%
                              </Badge>
                            </div>
                            
                            <p className="text-gray-700 mb-2">{alert.description}</p>
                            
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                              <h4 className="text-sm font-semibold text-orange-800 mb-1">
                                <TranslatedText text="Impact Assessment" />:
                              </h4>
                              <p className="text-sm text-orange-700">{alert.impact}</p>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <TranslatedText text="Detected" />: {alert.detectedAt}
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge className="h-4 w-4" />
                                {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {alert.status === 'active' && (
                          <div className="flex gap-2 ml-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAcknowledge(alert.id)}
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <TranslatedText text="Acknowledge" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleOverride(alert.id)}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              <TranslatedText text="Override" />
                            </Button>
                          </div>
                        )}
                        
                        {alert.status === 'acknowledged' && (
                          <div className="flex gap-2 ml-4">
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleOverride(alert.id)}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Override
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </main>
        </div>
        </div>
      </div>
    </RoleGuard>
  )
}
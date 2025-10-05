"use client"

import { useAuth } from '@/hooks/use-auth'
import { useState } from 'react'
import { TranslatedText } from '@/components/translation/translated-text'
import { RoleGuard } from '@/hooks/use-role-access'
import { OperatorSidebar } from '@/components/operator/operator-sidebar'
import { OperatorHeader } from '@/components/operator/operator-header'
import { AnimatedBackground } from '@/components/animated-background'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Train, Heart, Settings, Palette, Scale, Sparkles, Building, CheckCircle, AlertCircle, Circle, AlertTriangle } from 'lucide-react'

export default function OperatorTrainsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('fitness')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

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
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
                  <Train className="h-8 w-8 text-primary" />
                  <TranslatedText text="AI-Powered Train Insights" />
                </h1>
                <p className="text-muted-foreground mt-1">
                  <TranslatedText text="Monitor train health, job cards, and branding priorities with AI-driven insights" />
                </p>
              </div>
            </div>

            {/* Deep-Dive Navigation Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('fitness')}
                  className={`${
                    activeTab === 'fitness'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium flex items-center gap-1`}
                >
                  <Heart className="w-4 h-4" /> <TranslatedText text="Fitness Certificates" />
                </button>
                <button
                  onClick={() => setActiveTab('jobcards')}
                  className={`${
                    activeTab === 'jobcards'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium flex items-center gap-1`}
                >
                  <Settings className="w-4 h-4" /> <TranslatedText text="Job Card Status" />
                </button>
                <button
                  onClick={() => setActiveTab('branding')}
                  className={`${
                    activeTab === 'branding'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium flex items-center gap-1`}
                >
                  <Palette className="w-4 h-4" /> <TranslatedText text="Branding Priorities" />
                </button>
                <button
                  onClick={() => setActiveTab('mileage')}
                  className={`${
                    activeTab === 'mileage'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium flex items-center gap-1`}
                >
                  <Scale className="w-4 h-4" /> Mileage Balancing
                </button>
                <button
                  onClick={() => setActiveTab('cleaning')}
                  className={`${
                    activeTab === 'cleaning'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium flex items-center gap-1`}
                >
                  <Sparkles className="w-4 h-4" /> Cleaning Slots
                </button>
                <button
                  onClick={() => setActiveTab('stabling')}
                  className={`${
                    activeTab === 'stabling'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium flex items-center gap-1`}
                >
                  <Building className="w-4 h-4" /> Stabling Geometry
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'fitness' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" /> Fitness Certificates - Expiry Status
                  </CardTitle>
                  <CardDescription>
                    List of trains + expiry dates with highlighted expiring/expired trains
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Left</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">K01</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2025-01-15</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">11</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Expiring</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">K02</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2025-01-08</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">4 overdue</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="destructive" className="flex items-center gap-1"><Circle className="w-3 h-3 fill-current" /> Expired</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">K03</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2025-03-20</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">75</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Valid</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">K04</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2025-02-12</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">39</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Expiring</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">K05</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2025-04-18</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">104</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Valid</Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'jobcards' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" /> Job-Card Status - Pending vs Closed
                  </CardTitle>
                  <CardDescription>
                    Pending vs Closed jobs with AI flag for critical open work
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Jobs</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Jobs</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion %</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Flag</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">K01</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">8</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">75%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Clear to Run</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">K02</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">12</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">5</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">58%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Critical Open → Cannot Run</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">K03</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">6</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Clear to Run</Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'branding' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" /> Branding Priorities - Contract Exposure Tracking
                  </CardTitle>
                  <CardDescription>
                    Trains with active contracts, % achieved vs required exposure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Achieved %</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required %</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">K01</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Coca-Cola</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">85%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">90%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="destructive" className="flex items-center gap-1"><Circle className="w-3 h-3 fill-current" /> Must Run</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">K04</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Nike</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">70%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">80%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="destructive" className="flex items-center gap-1"><Circle className="w-3 h-3 fill-current" /> Must Run</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">K05</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Apple</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">92%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">88%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="default" className="bg-green-100 text-green-800">🟢 Normal</Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'mileage' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5" /> Mileage Balancing - Usage Distribution
                  </CardTitle>
                  <CardDescription>
                    Graph: Trainset ID vs Mileage with AI suggestions for rotation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-700">Mileage Comparison Chart</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 text-sm font-medium text-gray-900">K01</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <div className="h-6 rounded-full bg-green-500" style={{width: "79%"}}></div>
                            <div className="absolute top-0 h-6 w-1 bg-gray-800" style={{left: "81%"}} title="Average Mileage"></div>
                          </div>
                          <div className="w-20 text-sm text-gray-600">15,800km</div>
                          <div className="w-16">
                            <Badge variant="default" className="bg-green-100 text-green-800">OK</Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-12 text-sm font-medium text-gray-900">K02</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <div className="h-6 rounded-full bg-red-500" style={{width: "93%"}}></div>
                            <div className="absolute top-0 h-6 w-1 bg-gray-800" style={{left: "81%"}} title="Average Mileage"></div>
                          </div>
                          <div className="w-20 text-sm text-gray-600">18,500km</div>
                          <div className="w-16">
                            <Badge variant="destructive">High</Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-12 text-sm font-medium text-gray-900">K03</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <div className="h-6 rounded-full bg-blue-500" style={{width: "71%"}}></div>
                            <div className="absolute top-0 h-6 w-1 bg-gray-800" style={{left: "81%"}} title="Average Mileage"></div>
                          </div>
                          <div className="w-20 text-sm text-gray-600">14,200km</div>
                          <div className="w-16">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Low</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">🤖 AI Suggestions - Rotate Usage for Balance</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Prioritize K03 (low mileage) for tonight's operations</li>
                        <li>• Rest K02 (high mileage) for maintenance cycle</li>
                        <li>• Target 16,200km average across all trainsets</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'cleaning' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> Cleaning Slots - Bay Occupancy & Staff Availability
                  </CardTitle>
                  <CardDescription>
                    Bay occupancy + staff availability, pending vs completed cleaning tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Bay A</h4>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Train: K01</div>
                        <div>Staff: Available</div>
                        <div>ETA: 14:30</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Bay B</h4>
                        <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Train: K03</div>
                        <div>Staff: Busy</div>
                        <div>ETA: 13:45</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Bay C</h4>
                        <Badge variant="secondary">Free</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Train: Empty</div>
                        <div>Staff: Available</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Bay D</h4>
                        <Badge variant="destructive">Pending</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Train: K04</div>
                        <div>Staff: Available</div>
                        <div>ETA: 15:00</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'stabling' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" /> Stabling Geometry - Depot Grid View
                  </CardTitle>
                  <CardDescription>
                    Simple depot grid view with Train IDs and AI-suggested positions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-3">Current Positions</h4>
                      <div className="grid grid-cols-3 gap-4 max-w-md">
                        <div className="border-2 rounded-lg p-4 text-center border-blue-500 bg-blue-50">
                          <div className="text-sm font-medium text-gray-900 mb-1">A1</div>
                          <div className="text-lg font-bold text-blue-600">K01</div>
                          <div className="text-xs text-gray-500 mt-1">Move Score: 2</div>
                        </div>
                        <div className="border-2 rounded-lg p-4 text-center border-gray-300 bg-gray-50 border-dashed">
                          <div className="text-sm font-medium text-gray-900 mb-1">A2</div>
                          <div className="text-lg font-bold text-blue-600">Empty</div>
                        </div>
                        <div className="border-2 rounded-lg p-4 text-center border-blue-500 bg-blue-50">
                          <div className="text-sm font-medium text-gray-900 mb-1">A3</div>
                          <div className="text-lg font-bold text-blue-600">K03</div>
                          <div className="text-xs text-gray-500 mt-1">Move Score: 1</div>
                        </div>
                        <div className="border-2 rounded-lg p-4 text-center border-blue-500 bg-blue-50">
                          <div className="text-sm font-medium text-gray-900 mb-1">B1</div>
                          <div className="text-lg font-bold text-blue-600">K02</div>
                          <div className="text-xs text-gray-500 mt-1">Move Score: 3</div>
                        </div>
                        <div className="border-2 rounded-lg p-4 text-center border-blue-500 bg-blue-50">
                          <div className="text-sm font-medium text-gray-900 mb-1">B2</div>
                          <div className="text-lg font-bold text-blue-600">K04</div>
                          <div className="text-xs text-gray-500 mt-1">Move Score: 1</div>
                        </div>
                        <div className="border-2 rounded-lg p-4 text-center border-gray-300 bg-gray-50 border-dashed">
                          <div className="text-sm font-medium text-gray-900 mb-1">B3</div>
                          <div className="text-lg font-bold text-blue-600">Empty</div>
                        </div>
                        <div className="border-2 rounded-lg p-4 text-center border-blue-500 bg-blue-50">
                          <div className="text-sm font-medium text-gray-900 mb-1">C1</div>
                          <div className="text-lg font-bold text-blue-600">K05</div>
                          <div className="text-xs text-gray-500 mt-1">Move Score: 2</div>
                        </div>
                        <div className="border-2 rounded-lg p-4 text-center border-gray-300 bg-gray-50 border-dashed">
                          <div className="text-sm font-medium text-gray-900 mb-1">C2</div>
                          <div className="text-lg font-bold text-blue-600">Empty</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-green-800 mb-2">🤖 AI-Suggested Positions (Minimize Shunting Moves)</h4>
                      <div className="text-sm text-green-700 space-y-1">
                        <div>• Move K02 from B1 to A2 (reduces exit moves by 2)</div>
                        <div>• Keep K01 in A1 (optimal for quick dispatch)</div>
                        <div>• Position new arrivals in C2 for minimal interference</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
        </div>
      </div>
    </RoleGuard>
  )
}
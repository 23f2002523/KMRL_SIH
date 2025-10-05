"use client"

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { TranslatedText } from '@/components/translation/translated-text';
import { RoleGuard } from '@/hooks/use-role-access';
import { OperatorSidebar } from '@/components/operator/operator-sidebar';
import { OperatorHeader } from '@/components/operator/operator-header';
import { AnimatedBackground } from '@/components/animated-background';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';

interface HistoricalData {
  date: string;
  inductionsCompleted: number;
  totalScheduled: number;
  averageTime: number;
  issues: number;
  efficiency: number;
}

const Reports = () => {
  const { user } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [reportType, setReportType] = useState('operations');

  // Generate dynamic data based on selections
  const generateHistoricalData = (period: string, type: string) => {
    const baseData = {
      '7days': [
        { date: '2024-10-04', inductionsCompleted: 28, totalScheduled: 30, averageTime: 45, issues: 2, efficiency: 93.3 },
        { date: '2024-10-03', inductionsCompleted: 25, totalScheduled: 28, averageTime: 52, issues: 3, efficiency: 89.3 },
        { date: '2024-10-02', inductionsCompleted: 30, totalScheduled: 32, averageTime: 41, issues: 1, efficiency: 93.8 },
        { date: '2024-10-01', inductionsCompleted: 27, totalScheduled: 30, averageTime: 48, issues: 2, efficiency: 90.0 },
        { date: '2024-09-30', inductionsCompleted: 29, totalScheduled: 31, averageTime: 44, issues: 1, efficiency: 93.5 },
        { date: '2024-09-29', inductionsCompleted: 26, totalScheduled: 29, averageTime: 50, issues: 4, efficiency: 89.7 },
        { date: '2024-09-28', inductionsCompleted: 31, totalScheduled: 33, averageTime: 43, issues: 1, efficiency: 93.9 }
      ],
      '30days': [
        { date: '2024-10-04', inductionsCompleted: 120, totalScheduled: 128, averageTime: 47, issues: 8, efficiency: 93.8 },
        { date: '2024-09-27', inductionsCompleted: 115, totalScheduled: 125, averageTime: 49, issues: 12, efficiency: 92.0 },
        { date: '2024-09-20', inductionsCompleted: 108, totalScheduled: 118, averageTime: 51, issues: 15, efficiency: 91.5 },
        { date: '2024-09-13', inductionsCompleted: 122, totalScheduled: 130, averageTime: 45, issues: 6, efficiency: 93.8 },
        { date: '2024-09-06', inductionsCompleted: 95, totalScheduled: 105, averageTime: 53, issues: 18, efficiency: 90.5 }
      ],
      '90days': [
        { date: '2024-10-01', inductionsCompleted: 480, totalScheduled: 510, averageTime: 48, issues: 35, efficiency: 94.1 },
        { date: '2024-09-01', inductionsCompleted: 465, totalScheduled: 495, averageTime: 50, issues: 42, efficiency: 93.9 },
        { date: '2024-08-01', inductionsCompleted: 445, totalScheduled: 475, averageTime: 52, issues: 48, efficiency: 93.7 },
        { date: '2024-07-01', inductionsCompleted: 420, totalScheduled: 450, averageTime: 54, issues: 55, efficiency: 93.3 }
      ],
      '1year': [
        { date: '2024-Q4', inductionsCompleted: 1450, totalScheduled: 1520, averageTime: 49, issues: 125, efficiency: 95.4 },
        { date: '2024-Q3', inductionsCompleted: 1380, totalScheduled: 1460, averageTime: 51, issues: 140, efficiency: 94.5 },
        { date: '2024-Q2', inductionsCompleted: 1320, totalScheduled: 1400, averageTime: 53, issues: 165, efficiency: 94.3 },
        { date: '2024-Q1', inductionsCompleted: 1200, totalScheduled: 1280, averageTime: 55, issues: 180, efficiency: 93.8 }
      ]
    };

    let data = baseData[period as keyof typeof baseData] || baseData['7days'];

    // Modify data based on report type
    if (type === 'maintenance') {
      data = data.map(item => ({
        ...item,
        inductionsCompleted: Math.floor(item.inductionsCompleted * 0.85),
        issues: Math.floor(item.issues * 1.3),
        efficiency: item.efficiency - 2.5,
        averageTime: item.averageTime + 8
      }));
    } else if (type === 'performance') {
      data = data.map(item => ({
        ...item,
        inductionsCompleted: Math.floor(item.inductionsCompleted * 1.1),
        issues: Math.floor(item.issues * 0.7),
        efficiency: item.efficiency + 1.5,
        averageTime: item.averageTime - 3
      }));
    } else if (type === 'compliance') {
      data = data.map(item => ({
        ...item,
        inductionsCompleted: Math.floor(item.inductionsCompleted * 0.95),
        issues: Math.floor(item.issues * 0.5),
        efficiency: item.efficiency + 0.8,
        averageTime: item.averageTime + 2
      }));
    }

    return data;
  };

  const historicalData = generateHistoricalData(selectedPeriod, reportType);

  const summaryStats = {
    totalInductions: historicalData.reduce((sum, day) => sum + day.inductionsCompleted, 0),
    averageEfficiency: historicalData.reduce((sum, day) => sum + day.efficiency, 0) / historicalData.length,
    totalIssues: historicalData.reduce((sum, day) => sum + day.issues, 0),
    averageTime: historicalData.reduce((sum, day) => sum + day.averageTime, 0) / historicalData.length
  };

  // Format period and report type for display
  const getPeriodLabel = (period: string) => {
    const labels: { [key: string]: string } = {
      '7days': 'Last 7 Days',
      '30days': 'Last 30 Days', 
      '90days': 'Last 3 Months',
      '1year': 'Last Year'
    };
    return labels[period] || period;
  };

  const getReportTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'operations': 'Operations Report',
      'maintenance': 'Maintenance Report',
      'performance': 'Performance Report',
      'compliance': 'Compliance Report'
    };
    return labels[type] || type;
  };

  const handleExportPDF = () => {
    // Create comprehensive report content
    let reportContent = `KMRL OPERATIONS REPORT
${'='.repeat(50)}

Report Period: ${getPeriodLabel(selectedPeriod)}
Report Type: ${getReportTypeLabel(reportType)}
Generated: ${new Date().toLocaleString()}

EXECUTIVE SUMMARY
${'-'.repeat(20)}
• Total Inductions Completed: ${summaryStats.totalInductions}
• Average Efficiency: ${summaryStats.averageEfficiency.toFixed(1)}%
• Total Issues Encountered: ${summaryStats.totalIssues}
• Average Induction Time: ${summaryStats.averageTime.toFixed(1)} minutes

DETAILED PERFORMANCE DATA
${'-'.repeat(30)}
${'Date'.padEnd(12)} ${'Completed'.padEnd(12)} ${'Scheduled'.padEnd(12)} ${'Avg Time'.padEnd(12)} ${'Issues'.padEnd(10)} ${'Efficiency'.padEnd(12)}
${'-'.repeat(80)}
`;

    historicalData.forEach(day => {
      reportContent += `${new Date(day.date).toLocaleDateString().padEnd(12)} ${day.inductionsCompleted.toString().padEnd(12)} ${day.totalScheduled.toString().padEnd(12)} ${(day.averageTime + 'min').padEnd(12)} ${day.issues.toString().padEnd(10)} ${(day.efficiency.toFixed(1) + '%').padEnd(12)}\n`;
    });

    reportContent += `
${'-'.repeat(80)}

KEY INSIGHTS
${'-'.repeat(15)}
• Efficiency Improvement: Average efficiency increased by 2.3% this week
• Time Optimization: Average induction time reduced by 3 minutes
• Issue Reduction: 15% fewer issues compared to last period

RECOMMENDATIONS
${'-'.repeat(18)}
• Peak Performance Hours: Best efficiency between 8-10 AM and 2-4 PM
• Resource Allocation: Consider additional staff during peak hours
• Preventive Maintenance: Schedule maintenance during low-traffic periods

${'-'.repeat(50)}
End of Report - KMRL Operations Dashboard
Generated by MetroMind AI System
`;

    // Create as text file that can be easily opened
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'KMRL_Report_' + selectedPeriod + '_' + new Date().toISOString().split('T')[0] + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    let csvContent = "Date,Inductions Completed,Total Scheduled,Average Time,Issues,Efficiency\n";
    historicalData.forEach(row => {
      csvContent += row.date + ',' + row.inductionsCompleted + ',' + row.totalScheduled + ',' + row.averageTime + ',' + row.issues + ',' + row.efficiency + '\n';
    });
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'KMRL_Data_' + selectedPeriod + '_' + new Date().toISOString().split('T')[0] + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          
          <main className="flex-1 overflow-auto pt-20 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="bg-card text-card-foreground overflow-hidden shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground"><TranslatedText text="Analytics & Reports" /></h1>
                <p className="text-muted-foreground mt-1"><TranslatedText text="Comprehensive operational insights and performance analytics" /></p>
                <div className="mt-2 flex gap-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {getPeriodLabel(selectedPeriod)}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" /> {getReportTypeLabel(reportType)}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                <TranslatedText text="Export Report" />
              </Button>
              <Button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4" />
                <TranslatedText text="Export Excel" />
              </Button>              
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days"><TranslatedText text="Last 7 Days" /></SelectItem>
                  <SelectItem value="30days"><TranslatedText text="Last 30 Days" /></SelectItem>
                  <SelectItem value="90days"><TranslatedText text="Last 3 Months" /></SelectItem>
                  <SelectItem value="1year"><TranslatedText text="Last Year" /></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operations"><TranslatedText text="Operations" /></SelectItem>
                  <SelectItem value="maintenance"><TranslatedText text="Maintenance" /></SelectItem>
                  <SelectItem value="performance"><TranslatedText text="Performance" /></SelectItem>
                  <SelectItem value="compliance"><TranslatedText text="Compliance" /></SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"><TranslatedText text="Total Inductions" /></CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.totalInductions}</div>
                <p className="text-xs text-gray-600"><TranslatedText text="vs Previous Period" /></p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"><TranslatedText text="Average Efficiency" /></CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.averageEfficiency.toFixed(1)}%</div>
                <p className="text-xs text-green-600">+2.3% <TranslatedText text="improvement" /></p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"><TranslatedText text="Total Issues" /></CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.totalIssues}</div>
                <p className="text-xs text-green-600">-15% <TranslatedText text="vs Last Week" /></p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"><TranslatedText text="Average Time" /></CardTitle>
                <Clock className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.averageTime.toFixed(0)}m</div>
                <p className="text-xs text-green-600">-3min <TranslatedText text="improvement" /></p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <TranslatedText text="Historical Data" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-medium text-gray-600"><TranslatedText text="Date" /></th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600"><TranslatedText text="Completed" /></th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600"><TranslatedText text="Scheduled" /></th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600"><TranslatedText text="Avg Time" /></th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600"><TranslatedText text="Issues" /></th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600"><TranslatedText text="Efficiency" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.map((day, index) => (
                      <tr key={day.date} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2">{new Date(day.date).toLocaleDateString()}</td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {day.inductionsCompleted}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">{day.totalScheduled}</td>
                        <td className="py-3 px-2">{day.averageTime}min</td>
                        <td className="py-3 px-2">
                          {day.issues > 0 ? (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700">
                              {day.issues}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              0
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-blue-500" 
                                style={{ width: day.efficiency + '%' }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{day.efficiency.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
            </div>
          </main>
        </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default Reports;

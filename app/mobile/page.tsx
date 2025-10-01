"use client"

import { useState } from "react"
import { MobileLayout } from "@/components/mobile/mobile-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Camera, Clock, CheckCircle, AlertTriangle, TrendingUp, Search, Bell, Zap } from "lucide-react"

export default function MobileHomePage() {
  const [language, setLanguage] = useState<"en" | "ml">("en")

  const stats = {
    en: [
      { label: "Documents", value: "1,234", icon: FileText, color: "text-blue-600" },
      { label: "Pending", value: "45", icon: Clock, color: "text-yellow-600" },
      { label: "Approved", value: "987", icon: CheckCircle, color: "text-green-600" },
      { label: "Urgent", value: "12", icon: AlertTriangle, color: "text-red-600" },
    ],
    ml: [
      { label: "രേഖകൾ", value: "1,234", icon: FileText, color: "text-blue-600" },
      { label: "തീർപ്പാക്കാത്ത", value: "45", icon: Clock, color: "text-yellow-600" },
      { label: "അംഗീകരിച്ചത്", value: "987", icon: CheckCircle, color: "text-green-600" },
      { label: "അടിയന്തിരം", value: "12", icon: AlertTriangle, color: "text-red-600" },
    ],
  }

  const quickActions = {
    en: [
      { label: "Capture Document", icon: Camera, href: "/mobile/camera", color: "bg-blue-500" },
      { label: "Search Documents", icon: Search, href: "/mobile/search", color: "bg-green-500" },
      { label: "View Notifications", icon: Bell, href: "/mobile/notifications", color: "bg-orange-500" },
      { label: "AI Assistant", icon: Zap, href: "/mobile/ai-chat", color: "bg-purple-500" },
    ],
    ml: [
      { label: "രേഖ ക്യാപ്ചർ", icon: Camera, href: "/mobile/camera", color: "bg-blue-500" },
      { label: "രേഖകൾ തിരയുക", icon: Search, href: "/mobile/search", color: "bg-green-500" },
      { label: "അറിയിപ്പുകൾ കാണുക", icon: Bell, href: "/mobile/notifications", color: "bg-orange-500" },
      { label: "AI സഹായി", icon: Zap, href: "/mobile/ai-chat", color: "bg-purple-500" },
    ],
  }

  const recentDocuments = [
    {
      id: "1",
      title: language === "en" ? "Safety Protocol Update" : "സുരക്ഷാ പ്രോട്ടോക്കോൾ അപ്ഡേറ്റ്",
      status: "pending",
      priority: "high",
      date: "2024-01-15",
    },
    {
      id: "2",
      title: language === "en" ? "Maintenance Report" : "അറ്റകുറ്റപ്പണി റിപ്പോർട്ട്",
      status: "approved",
      priority: "medium",
      date: "2024-01-10",
    },
    {
      id: "3",
      title: language === "en" ? "Training Schedule" : "പരിശീലന ഷെഡ്യൂൾ",
      status: "classified",
      priority: "low",
      date: "2024-01-08",
    },
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      classified: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      en: { pending: "Pending", approved: "Approved", classified: "Classified" },
      ml: { pending: "തീർപ്പാക്കാത്ത", approved: "അംഗീകരിച്ചത്", classified: "വർഗ്ഗീകരിച്ചത്" },
    }
    return statusMap[language][status as keyof typeof statusMap.en] || status
  }

  return (
    <MobileLayout language={language} onLanguageChange={setLanguage}>
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold text-balance mb-2">
            {language === "en" ? "Welcome to KMRL" : "KMRL-ലേക്ക് സ്വാഗതം"}
          </h1>
          <p className="text-muted-foreground text-pretty">
            {language === "en" ? "Smart Document Assistant" : "സ്മാർട്ട് ഡോക്യുമെന്റ് അസിസ്റ്റന്റ്"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats[language].map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-4">
                <div className="flex flex-col items-center gap-2">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{language === "en" ? "Quick Actions" : "ദ്രുത പ്രവർത്തനങ്ങൾ"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions[language].map((action, index) => (
                <Button key={index} variant="outline" className="h-20 flex-col gap-2 p-4 bg-transparent" asChild>
                  <a href={action.href}>
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-center">{action.label}</span>
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              {language === "en" ? "Recent Documents" : "സമീപകാല രേഖകൾ"}
              <Button variant="ghost" size="sm">
                {language === "en" ? "View All" : "എല്ലാം കാണുക"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">{doc.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(doc.status)} variant="secondary">
                        {getStatusText(doc.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{doc.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sync Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {language === "en" ? "Sync Status" : "സിങ്ക് സ്റ്റാറ്റസ്"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>{language === "en" ? "Documents synced" : "സിങ്ക് ചെയ്ത രേഖകൾ"}</span>
                <span className="font-medium">987/1000</span>
              </div>
              <Progress value={98.7} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {language === "en" ? "Last synced: 2 minutes ago" : "അവസാനം സിങ്ക് ചെയ്തത്: 2 മിനിറ്റ് മുമ്പ്"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}

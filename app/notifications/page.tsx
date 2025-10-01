"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle, AlertTriangle, Info, Clock, KanbanSquareDashed as MarkAsUnread } from "lucide-react"

export default function NotificationsPage() {
  const [language, setLanguage] = useState<"en" | "ml">("en")

  const notifications = [
    {
      id: "1",
      title: language === "en" ? "Document Approval Required" : "രേഖ അംഗീകാരം ആവശ്യം",
      message:
        language === "en"
          ? "Safety Protocol Update requires your approval"
          : "സുരക്ഷാ പ്രോട്ടോക്കോൾ അപ്ഡേറ്റിന് നിങ്ങളുടെ അംഗീകാരം ആവശ്യമാണ്",
      type: "approval",
      priority: "high",
      read: false,
      timestamp: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      title: language === "en" ? "Document Processing Complete" : "രേഖ പ്രോസസ്സിംഗ് പൂർത്തിയായി",
      message:
        language === "en"
          ? "Budget Allocation Report has been processed and classified"
          : "ബജറ്റ് വിഹിതം റിപ്പോർട്ട് പ്രോസസ്സ് ചെയ്ത് വർഗ്ഗീകരിച്ചു",
      type: "success",
      priority: "medium",
      read: false,
      timestamp: "2024-01-14T16:45:00Z",
    },
    {
      id: "3",
      title: language === "en" ? "System Maintenance Scheduled" : "സിസ്റ്റം മെയിന്റനൻസ് ഷെഡ്യൂൾ ചെയ്തു",
      message:
        language === "en"
          ? "Scheduled maintenance on Jan 20, 2024 from 2:00 AM to 4:00 AM"
          : "ജനുവരി 20, 2024 രാത്രി 2:00 മുതൽ 4:00 വരെ ഷെഡ്യൂൾ ചെയ്ത മെയിന്റനൻസ്",
      type: "info",
      priority: "low",
      read: true,
      timestamp: "2024-01-13T09:15:00Z",
    },
    {
      id: "4",
      title: language === "en" ? "Document Upload Failed" : "രേഖ അപ്‌ലോഡ് പരാജയപ്പെട്ടു",
      message:
        language === "en"
          ? "Training Schedule upload failed due to file size limit"
          : "ഫയൽ സൈസ് പരിധി കാരണം പരിശീലന ഷെഡ്യൂൾ അപ്‌ലോഡ് പരാജയപ്പെട്ടു",
      type: "error",
      priority: "medium",
      read: true,
      timestamp: "2024-01-12T14:20:00Z",
    },
    {
      id: "5",
      title: language === "en" ? "New User Registration" : "പുതിയ ഉപയോക്തൃ രജിസ്ട്രേഷൻ",
      message:
        language === "en"
          ? "New user Mohammed Ali has registered and requires approval"
          : "പുതിയ ഉപയോക്താവ് മുഹമ്മദ് അലി രജിസ്റ്റർ ചെയ്തു, അംഗീകാരം ആവശ്യമാണ്",
      type: "info",
      priority: "low",
      read: true,
      timestamp: "2024-01-11T11:30:00Z",
    },
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "approval":
        return <Clock className="h-5 w-5 text-orange-600" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getPriorityText = (priority: string) => {
    const priorityMap = {
      en: { low: "Low", medium: "Medium", high: "High" },
      ml: { low: "കുറഞ്ഞത്", medium: "ഇടത്തരം", high: "ഉയർന്നത്" },
    }
    return priorityMap[language][priority as keyof typeof priorityMap.en] || priority
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DashboardLayout language={language} onLanguageChange={setLanguage}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{language === "en" ? "Notifications" : "അറിയിപ്പുകൾ"}</h1>
            <p className="text-muted-foreground">
              {language === "en" ? `${unreadCount} unread notifications` : `${unreadCount} വായിക്കാത്ത അറിയിപ്പുകൾ`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <MarkAsUnread className="mr-2 h-4 w-4" />
              {language === "en" ? "Mark All Read" : "എല്ലാം വായിച്ചതായി അടയാളപ്പെടുത്തുക"}
            </Button>
            <Button>{language === "en" ? "Settings" : "ക്രമീകരണങ്ങൾ"}</Button>
          </div>
        </div>

        {/* Notification Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                  <p className="text-sm text-muted-foreground">{language === "en" ? "Total" : "മൊത്തം"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <MarkAsUnread className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                  <p className="text-sm text-muted-foreground">{language === "en" ? "Unread" : "വായിക്കാത്തത്"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notifications.filter((n) => n.priority === "high").length}</p>
                  <p className="text-sm text-muted-foreground">{language === "en" ? "High Priority" : "ഉയർന്ന മുൻഗണന"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notifications.filter((n) => n.type === "approval").length}</p>
                  <p className="text-sm text-muted-foreground">{language === "en" ? "Approvals" : "അംഗീകാരങ്ങൾ"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`${!notification.read ? "border-l-4 border-l-primary" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3
                          className={`font-semibold ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 text-pretty">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={getPriorityColor(notification.priority)} variant="secondary">
                          {getPriorityText(notification.priority)}
                        </Badge>
                        {!notification.read && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                      </div>
                    </div>
                    {notification.type === "approval" && (
                      <div className="flex gap-2 mt-4">
                        <Button size="sm">{language === "en" ? "Approve" : "അംഗീകരിക്കുക"}</Button>
                        <Button variant="outline" size="sm">
                          {language === "en" ? "Reject" : "നിരസിക്കുക"}
                        </Button>
                        <Button variant="ghost" size="sm">
                          {language === "en" ? "View Details" : "വിശദാംശങ്ങൾ കാണുക"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {notifications.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{language === "en" ? "No notifications" : "അറിയിപ്പുകളില്ല"}</h3>
              <p className="text-muted-foreground text-center">
                {language === "en" ? "You're all caught up!" : "നിങ്ങൾ എല്ലാം കാണുകയും ചെയ്തു!"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

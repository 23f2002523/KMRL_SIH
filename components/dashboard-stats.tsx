"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
  language: "en" | "ml"
}

const statsData = {
  en: [
    {
      title: "Total Documents",
      value: "1,234",
      change: "+12%",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Pending Review",
      value: "45",
      change: "-8%",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Approved",
      value: "987",
      change: "+15%",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Urgent Items",
      value: "12",
      change: "+3%",
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ],
  ml: [
    {
      title: "മൊത്തം രേഖകൾ",
      value: "1,234",
      change: "+12%",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "അവലോകനത്തിനായി",
      value: "45",
      change: "-8%",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "അംഗീകരിച്ചത്",
      value: "987",
      change: "+15%",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "അടിയന്തിര ഇനങ്ങൾ",
      value: "12",
      change: "+3%",
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ],
}

export function DashboardStats({ language }: DashboardStatsProps) {
  const stats = statsData[language]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span className={stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}>{stat.change}</span>
              <span className="ml-1">{language === "en" ? "from last month" : "കഴിഞ്ഞ മാസത്തിൽ നിന്ന്"}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

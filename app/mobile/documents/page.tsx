"use client"

import { useState } from "react"
import { MobileLayout } from "@/components/mobile/mobile-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, FileText, MoreVertical, Download, Eye, Clock, User, Camera, Plus } from "lucide-react"

// Mock data for mobile documents
const mockDocuments = [
  {
    id: "1",
    title: "Safety Protocol Update - Platform Operations",
    malayalam_title: "സുരക്ഷാ പ്രോട്ടോക്കോൾ അപ്ഡേറ്റ് - പ്ലാറ്റ്ഫോം പ്രവർത്തനങ്ങൾ",
    status: "pending",
    priority: "high",
    source_type: "upload",
    created_at: "2024-01-15T10:30:00Z",
    file_size: 2048000,
  },
  {
    id: "2",
    title: "Monthly Maintenance Report - December 2023",
    malayalam_title: "മാസിക അറ്റകുറ്റപ്പണി റിപ്പോർട്ട് - ഡിസംബർ 2023",
    status: "approved",
    priority: "medium",
    source_type: "email",
    created_at: "2024-01-10T14:20:00Z",
    file_size: 1536000,
  },
  {
    id: "3",
    title: "Employee Training Schedule - Q1 2024",
    malayalam_title: "ജീവനക്കാരുടെ പരിശീലന ഷെഡ്യൂൾ - Q1 2024",
    status: "classified",
    priority: "low",
    source_type: "mobile_camera",
    created_at: "2024-01-08T11:45:00Z",
    file_size: 512000,
  },
  {
    id: "4",
    title: "Budget Allocation Report - FY 2024",
    malayalam_title: "ബജറ്റ് വിഹിതം റിപ്പോർട്ട് - FY 2024",
    status: "processing",
    priority: "urgent",
    source_type: "sharepoint",
    created_at: "2024-01-05T09:00:00Z",
    file_size: 3072000,
  },
]

export default function MobileDocumentsPage() {
  const [language, setLanguage] = useState<"en" | "ml">("en")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredDocuments = mockDocuments.filter((doc) => {
    const title = language === "ml" && doc.malayalam_title ? doc.malayalam_title : doc.title
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      classified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      en: {
        pending: "Pending",
        processing: "Processing",
        classified: "Classified",
        approved: "Approved",
        rejected: "Rejected",
      },
      ml: {
        pending: "തീർപ്പാക്കാത്ത",
        processing: "പ്രോസസ്സിംഗ്",
        classified: "വർഗ്ഗീകരിച്ചത്",
        approved: "അംഗീകരിച്ചത്",
        rejected: "നിരസിച്ചത്",
      },
    }
    return statusMap[language][status as keyof typeof statusMap.en] || status
  }

  const getPriorityText = (priority: string) => {
    const priorityMap = {
      en: { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" },
      ml: { low: "കുറഞ്ഞത്", medium: "ഇടത്തരം", high: "ഉയർന്നത്", urgent: "അടിയന്തിരം" },
    }
    return priorityMap[language][priority as keyof typeof priorityMap.en] || priority
  }

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "mobile_camera":
        return <Camera className="h-3 w-3" />
      case "upload":
        return <FileText className="h-3 w-3" />
      case "email":
        return <User className="h-3 w-3" />
      default:
        return <FileText className="h-3 w-3" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === "en" ? "en-US" : "ml-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <MobileLayout language={language} onLanguageChange={setLanguage}>
      <div className="p-4 space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-balance">{language === "en" ? "Documents" : "രേഖകൾ"}</h1>
            <p className="text-sm text-muted-foreground">
              {language === "en"
                ? `${filteredDocuments.length} documents found`
                : `${filteredDocuments.length} രേഖകൾ കണ്ടെത്തി`}
            </p>
          </div>
          <Button size="sm" asChild>
            <a href="/mobile/camera">
              <Plus className="h-4 w-4 mr-1" />
              {language === "en" ? "Add" : "ചേർക്കുക"}
            </a>
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === "en" ? "Search documents..." : "രേഖകൾ തിരയുക..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={language === "en" ? "All Status" : "എല്ലാ സ്റ്റാറ്റസും"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === "en" ? "All Status" : "എല്ലാ സ്റ്റാറ്റസും"}</SelectItem>
                    <SelectItem value="pending">{language === "en" ? "Pending" : "തീർപ്പാക്കാത്ത"}</SelectItem>
                    <SelectItem value="processing">{language === "en" ? "Processing" : "പ്രോസസ്സിംഗ്"}</SelectItem>
                    <SelectItem value="approved">{language === "en" ? "Approved" : "അംഗീകരിച്ചത്"}</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <div className="space-y-3">
          {filteredDocuments.map((document) => {
            const title = language === "ml" && document.malayalam_title ? document.malayalam_title : document.title

            return (
              <Card key={document.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm line-clamp-2 text-balance">{title}</h3>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge className={getStatusColor(document.status)} variant="secondary">
                          {getStatusText(document.status)}
                        </Badge>
                        <Badge className={getPriorityColor(document.priority)} variant="outline">
                          {getPriorityText(document.priority)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {getSourceIcon(document.source_type)}
                            <span>{formatFileSize(document.file_size)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(document.created_at)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === "en" ? "No documents found" : "രേഖകൾ കണ്ടെത്തിയില്ല"}
              </h3>
              <p className="text-muted-foreground text-center text-pretty mb-4">
                {language === "en"
                  ? "Try adjusting your search or capture a new document"
                  : "നിങ്ങളുടെ തിരയൽ ക്രമീകരിക്കുക അല്ലെങ്കിൽ പുതിയ രേഖ ക്യാപ്ചർ ചെയ്യുക"}
              </p>
              <Button asChild>
                <a href="/mobile/camera">
                  <Camera className="mr-2 h-4 w-4" />
                  {language === "en" ? "Capture Document" : "രേഖ ക്യാപ്ചർ ചെയ്യുക"}
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  )
}

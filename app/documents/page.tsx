"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DocumentCard } from "@/components/document-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Grid, List, Plus, Download, FileText } from "lucide-react"
import type { Document } from "@/lib/database"

// Extended mock data
const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Safety Protocol Update - Platform Operations",
    malayalam_title: "സുരക്ഷാ പ്രോട്ടോക്കോൾ അപ്ഡേറ്റ് - പ്ലാറ്റ്ഫോം പ്രവർത്തനങ്ങൾ",
    description: "Updated safety protocols for platform operations during peak hours",
    malayalam_description: "തിരക്കേറിയ സമയങ്ങളിൽ പ്ലാറ്റ്ഫോം പ്രവർത്തനങ്ങൾക്കായുള്ള അപ്ഡേറ്റ് ചെയ്ത സുരക്ഷാ പ്രോട്ടോക്കോളുകൾ",
    file_path: "/documents/safety-protocol-001.pdf",
    file_name: "safety-protocol-001.pdf",
    language: "en",
    source_type: "upload",
    uploaded_by: "user-1",
    status: "pending",
    priority: "high",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    title: "Monthly Maintenance Report - December 2023",
    malayalam_title: "മാസിക അറ്റകുറ്റപ്പണി റിപ്പോർട്ട് - ഡിസംബർ 2023",
    description: "Comprehensive maintenance report for all metro systems",
    file_path: "/documents/maintenance-report-dec-2023.pdf",
    file_name: "maintenance-report-dec-2023.pdf",
    language: "en",
    source_type: "email",
    uploaded_by: "user-2",
    status: "approved",
    priority: "medium",
    created_at: "2024-01-10T14:20:00Z",
    updated_at: "2024-01-12T09:15:00Z",
  },
  {
    id: "3",
    title: "Employee Training Schedule - Q1 2024",
    malayalam_title: "ജീവനക്കാരുടെ പരിശീലന ഷെഡ്യൂൾ - Q1 2024",
    description: "Training schedule for all departments in Q1 2024",
    file_path: "/documents/training-schedule-q1-2024.xlsx",
    file_name: "training-schedule-q1-2024.xlsx",
    language: "en",
    source_type: "sharepoint",
    uploaded_by: "user-3",
    status: "classified",
    priority: "low",
    created_at: "2024-01-08T11:45:00Z",
    updated_at: "2024-01-09T16:30:00Z",
  },
  {
    id: "4",
    title: "Budget Allocation Report - FY 2024",
    malayalam_title: "ബജറ്റ് വിഹിതം റിപ്പോർട്ട് - FY 2024",
    description: "Annual budget allocation across all departments",
    file_path: "/documents/budget-allocation-2024.pdf",
    file_name: "budget-allocation-2024.pdf",
    language: "en",
    source_type: "upload",
    uploaded_by: "user-4",
    status: "processing",
    priority: "urgent",
    created_at: "2024-01-05T09:00:00Z",
    updated_at: "2024-01-06T14:30:00Z",
  },
  {
    id: "5",
    title: "Environmental Impact Assessment",
    malayalam_title: "പരിസ്ഥിതി ആഘാത വിലയിരുത്തൽ",
    description: "Environmental impact assessment for new metro line extension",
    file_path: "/documents/environmental-impact-2024.pdf",
    file_name: "environmental-impact-2024.pdf",
    language: "en",
    source_type: "mobile_camera",
    uploaded_by: "user-5",
    status: "rejected",
    priority: "medium",
    created_at: "2024-01-03T16:15:00Z",
    updated_at: "2024-01-04T11:20:00Z",
  },
]

export default function DocumentsPage() {
  const [language, setLanguage] = useState<"en" | "ml">("en")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.malayalam_title && doc.malayalam_title.includes(searchQuery)) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    const matchesPriority = priorityFilter === "all" || doc.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleDocumentView = (document: Document) => {
    console.log("Viewing document:", document.id)
  }

  const handleDocumentEdit = (document: Document) => {
    console.log("Editing document:", document.id)
  }

  const handleDocumentDelete = (document: Document) => {
    console.log("Deleting document:", document.id)
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar language={language} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader language={language} onLanguageChange={setLanguage} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-balance">
                  {language === "en" ? "Documents" : "രേഖകൾ"}
                </h1>
                <p className="text-muted-foreground text-pretty">
                  {language === "en"
                    ? "Manage and organize all your documents"
                    : "നിങ്ങളുടെ എല്ലാ രേഖകളും കൈകാര്യം ചെയ്യുകയും സംഘടിപ്പിക്കുകയും ചെയ്യുക"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  {language === "en" ? "Export" : "എക്സ്പോർട്ട്"}
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {language === "en" ? "Upload Document" : "രേഖ അപ്‌ലോഡ് ചെയ്യുക"}
                </Button>
              </div>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{language === "en" ? "Search & Filter" : "തിരയൽ & ഫിൽട്ടർ"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={language === "en" ? "Search documents..." : "രേഖകൾ തിരയുക..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={language === "en" ? "Status" : "സ്റ്റാറ്റസ്"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{language === "en" ? "All Status" : "എല്ലാ സ്റ്റാറ്റസും"}</SelectItem>
                        <SelectItem value="pending">{language === "en" ? "Pending" : "തീർപ്പാക്കാത്ത"}</SelectItem>
                        <SelectItem value="processing">{language === "en" ? "Processing" : "പ്രോസസ്സിംഗ്"}</SelectItem>
                        <SelectItem value="approved">{language === "en" ? "Approved" : "അംഗീകരിച്ചത്"}</SelectItem>
                        <SelectItem value="rejected">{language === "en" ? "Rejected" : "നിരസിച്ചത്"}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={language === "en" ? "Priority" : "മുൻഗണന"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{language === "en" ? "All Priority" : "എല്ലാ മുൻഗണനയും"}</SelectItem>
                        <SelectItem value="low">{language === "en" ? "Low" : "കുറഞ്ഞത്"}</SelectItem>
                        <SelectItem value="medium">{language === "en" ? "Medium" : "ഇടത്തരം"}</SelectItem>
                        <SelectItem value="high">{language === "en" ? "High" : "ഉയർന്നത്"}</SelectItem>
                        <SelectItem value="urgent">{language === "en" ? "Urgent" : "അടിയന്തിരം"}</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center border rounded-md">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-r-none"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-l-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <span className="text-sm text-muted-foreground">
                    {language === "en"
                      ? `Showing ${filteredDocuments.length} of ${mockDocuments.length} documents`
                      : `${mockDocuments.length} രേഖകളിൽ ${filteredDocuments.length} എണ്ണം കാണിക്കുന്നു`}
                  </span>
                  {(statusFilter !== "all" || priorityFilter !== "all" || searchQuery) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStatusFilter("all")
                        setPriorityFilter("all")
                        setSearchQuery("")
                      }}
                    >
                      {language === "en" ? "Clear Filters" : "ഫിൽട്ടറുകൾ മായ്ക്കുക"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Documents Grid/List */}
            <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  language={language}
                  onView={handleDocumentView}
                  onEdit={handleDocumentEdit}
                  onDelete={handleDocumentDelete}
                />
              ))}
            </div>

            {filteredDocuments.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {language === "en" ? "No documents found" : "രേഖകൾ കണ്ടെത്തിയില്ല"}
                  </h3>
                  <p className="text-muted-foreground text-center text-pretty">
                    {language === "en"
                      ? "Try adjusting your search criteria or upload a new document"
                      : "നിങ്ങളുടെ തിരയൽ മാനദണ്ഡങ്ങൾ ക്രമീകരിക്കാൻ ശ്രമിക്കുക അല്ലെങ്കിൽ ഒരു പുതിയ രേഖ അപ്‌ലോഡ് ചെയ്യുക"}
                  </p>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    {language === "en" ? "Upload Document" : "രേഖ അപ്‌ലോഡ് ചെയ്യുക"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

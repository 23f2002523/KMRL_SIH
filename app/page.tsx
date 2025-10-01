"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardStats } from "@/components/dashboard-stats"
import { DocumentCard } from "@/components/document-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Filter, MoreHorizontal, FileText } from "lucide-react"
import type { Document } from "@/lib/database"

// Mock data for demonstration
const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Safety Protocol Update - Platform Operations",
    malayalam_title: "സുരക്ഷാ പ്രോട്ടോക്കോളുകൾ അപ്ഡേറ്റ് - പ്ലാറ്റ്ഫോം പ്രവർത്തനങ്ങൾ",
    description: "Updated safety protocols for platform operations during peak hours",
    malayalam_description: "തിരക്കേറിയ സമയങ്ങളിൽ പ്ലാറ്റ്ഫോം പ്രവർത്തനങ്ങൾക്കായുള്ള അപ്ഡേറ്റ് ചെയ്ത സുരക്ഷാ പ്രോട്ടോക്കോളുകൾ",
    file_path: "/documents/safety-protocol-001.pdf",
    file_name: "safety-protocol-001.pdf",
    file_size: 2048000,
    mime_type: "application/pdf",
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
]

export default function DashboardPage() {
  const [language, setLanguage] = useState<"en" | "ml">("en")

  const handleDocumentView = (document: Document) => {
    console.log("Viewing document:", document.id)
    // TODO: Navigate to document detail page
  }

  const handleDocumentEdit = (document: Document) => {
    console.log("Editing document:", document.id)
    // TODO: Navigate to document edit page
  }

  const handleDocumentDelete = (document: Document) => {
    console.log("Deleting document:", document.id)
    // TODO: Show confirmation dialog and delete
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
                  {language === "en" ? "Dashboard" : "ഡാഷ്ബോർഡ്"}
                </h1>
                <p className="text-muted-foreground text-pretty">
                  {language === "en"
                    ? "Welcome to KMRL Smart Document Assistant"
                    : "KMRL സ്മാർട്ട് ഡോക്യുമെന്റ് അസിസ്റ്റന്റിലേക്ക് സ്വാഗതം"}
                </p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {language === "en" ? "Upload Document" : "രേഖ അപ്‌ലോഡ് ചെയ്യുക"}
              </Button>
            </div>

            {/* Stats */}
            <DashboardStats language={language} />

            {/* Recent Documents */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{language === "en" ? "Recent Documents" : "സമീപകാല രേഖകൾ"}</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    {language === "en" ? "Filter" : "ഫിൽട്ടർ"}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockDocuments.map((document) => (
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
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{language === "en" ? "Quick Actions" : "ദ്രുത പ്രവർത്തനങ്ങൾ"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">{language === "en" ? "Upload Document" : "രേഖ അപ്‌ലോഡ്"}</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">{language === "en" ? "Create Report" : "റിപ്പോർട്ട് സൃഷ്ടിക്കുക"}</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                    <Badge className="h-6 w-6" />
                    <span className="text-sm">{language === "en" ? "Review Pending" : "തീർപ്പാക്കാത്തവ അവലോകനം"}</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                    <MoreHorizontal className="h-6 w-6" />
                    <span className="text-sm">{language === "en" ? "More Actions" : "കൂടുതൽ പ്രവർത്തനങ്ങൾ"}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

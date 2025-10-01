"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Archive, Download, Eye, Calendar, FileText, Filter } from "lucide-react"

export default function ArchivePage() {
  const [language, setLanguage] = useState<"en" | "ml">("en")
  const [searchQuery, setSearchQuery] = useState("")
  const [yearFilter, setYearFilter] = useState<string>("all")

  const archivedDocuments = [
    {
      id: "1",
      title: language === "en" ? "Annual Safety Report 2023" : "വാർഷിക സുരക്ഷാ റിപ്പോർട്ട് 2023",
      category: "Safety",
      year: "2023",
      archived_date: "2024-01-01",
      file_size: "2.5 MB",
      status: "archived",
    },
    {
      id: "2",
      title: language === "en" ? "Employee Handbook v2.1" : "ജീവനക്കാരുടെ ഹാൻഡ്ബുക്ക് v2.1",
      category: "HR",
      year: "2023",
      archived_date: "2023-12-15",
      file_size: "1.8 MB",
      status: "archived",
    },
    {
      id: "3",
      title: language === "en" ? "Infrastructure Maintenance Log 2022" : "ഇൻഫ്രാസ്ട്രക്ചർ മെയിന്റനൻസ് ലോഗ് 2022",
      category: "Engineering",
      year: "2022",
      archived_date: "2023-01-10",
      file_size: "4.2 MB",
      status: "archived",
    },
  ]

  const filteredDocuments = archivedDocuments.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesYear = yearFilter === "all" || doc.year === yearFilter
    return matchesSearch && matchesYear
  })

  return (
    <DashboardLayout language={language} onLanguageChange={setLanguage}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{language === "en" ? "Document Archive" : "രേഖ ആർക്കൈവ്"}</h1>
          <p className="text-muted-foreground">
            {language === "en"
              ? "Access archived documents and historical records"
              : "ആർക്കൈവ് ചെയ്ത രേഖകളും ചരിത്ര രേഖകളും ആക്സസ് ചെയ്യുക"}
          </p>
        </div>

        {/* Archive Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Archive className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1,234</p>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Total Archived" : "മൊത്തം ആർക്കൈവ്"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">45</p>
                  <p className="text-sm text-muted-foreground">{language === "en" ? "This Month" : "ഈ മാസം"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Years of Data" : "വർഷങ്ങളുടെ ഡാറ്റ"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Download className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">15.2 GB</p>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Storage Used" : "ഉപയോഗിച്ച സ്റ്റോറേജ്"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>{language === "en" ? "Search Archive" : "ആർക്കൈവ് തിരയുക"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === "en" ? "Search archived documents..." : "ആർക്കൈവ് ചെയ്ത രേഖകൾ തിരയുക..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={language === "en" ? "Year" : "വർഷം"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "en" ? "All Years" : "എല്ലാ വർഷങ്ങളും"}</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                {language === "en" ? "More Filters" : "കൂടുതൽ ഫിൽട്ടറുകൾ"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Archived Documents */}
        <div className="space-y-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <Archive className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{document.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>
                          {language === "en" ? "Category:" : "വിഭാഗം:"} {document.category}
                        </span>
                        <span>
                          {language === "en" ? "Size:" : "വലുപ്പം:"} {document.file_size}
                        </span>
                        <span>
                          {language === "en" ? "Archived:" : "ആർക്കൈവ് ചെയ്തത്:"}{" "}
                          {new Date(document.archived_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{document.year}</Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      {language === "en" ? "View" : "കാണുക"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      {language === "en" ? "Download" : "ഡൗൺലോഡ്"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Archive className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === "en" ? "No archived documents found" : "ആർക്കൈവ് ചെയ്ത രേഖകൾ കണ്ടെത്തിയില്ല"}
              </h3>
              <p className="text-muted-foreground text-center">
                {language === "en" ? "Try adjusting your search criteria" : "നിങ്ങളുടെ തിരയൽ മാനദണ്ഡങ്ങൾ ക്രമീകരിക്കാൻ ശ്രമിക്കുക"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

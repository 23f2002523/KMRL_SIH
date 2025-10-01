"use client"

import { useState, useEffect } from "react"
import { Search, FileText, Calendar, User, Tag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/dashboard-layout"

interface SearchResult {
  id: string
  title: string
  content: string
  category: string
  department: string
  date: string
  author: string
  tags: string[]
  language: "en" | "ml"
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    category: "All Categories",
    department: "All Departments",
    language: "All Languages",
    dateRange: "",
  })

  // Mock search results for demo
  const mockResults: SearchResult[] = [
    {
      id: "1",
      title: "Safety Protocol Update - Platform Operations",
      content:
        "Updated safety protocols for platform operations including emergency procedures and passenger safety guidelines...",
      category: "Safety",
      department: "Operations",
      date: "2024-01-15",
      author: "Safety Officer",
      tags: ["safety", "platform", "emergency"],
      language: "en",
    },
    {
      id: "2",
      title: "പ്ലാറ്റ്ഫോം സുരക്ഷാ നിർദ്ദേശങ്ങൾ",
      content: "പ്ലാറ്റ്ഫോം പ്രവർത്തനങ്ങൾക്കായുള്ള അപ്ഡേറ്റ് ചെയ്ത സുരക്ഷാ പ്രോട്ടോക്കോളുകൾ...",
      category: "Safety",
      department: "Operations",
      date: "2024-01-14",
      author: "സുരക്ഷാ ഓഫീസർ",
      tags: ["സുരക്ഷ", "പ്ലാറ്റ്ഫോം"],
      language: "ml",
    },
    {
      id: "3",
      title: "HR Policy Changes - Leave Management",
      content: "New leave management policies effective from February 2024 including updated approval workflows...",
      category: "HR",
      department: "Human Resources",
      date: "2024-01-10",
      author: "HR Manager",
      tags: ["hr", "leave", "policy"],
      language: "en",
    },
  ]

  const performSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Filter mock results based on query and filters
      const filtered = mockResults.filter((result) => {
        const matchesQuery =
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.content.toLowerCase().includes(query.toLowerCase()) ||
          result.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))

        const matchesCategory = filters.category === "All Categories" || result.category === filters.category
        const matchesDepartment = filters.department === "All Departments" || result.department === filters.department
        const matchesLanguage = filters.language === "All Languages" || result.language === filters.language

        return matchesQuery && matchesCategory && matchesDepartment && matchesLanguage
      })

      setResults(filtered)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (query) {
      const debounceTimer = setTimeout(performSearch, 300)
      return () => clearTimeout(debounceTimer)
    } else {
      setResults([])
    }
  }, [query, filters])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold">Document Search</h1>
          <p className="text-muted-foreground">Search through all documents with AI-powered multilingual support</p>
        </div>

        {/* Search Input */}
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents in English or Malayalam..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={performSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Categories">All Categories</SelectItem>
              <SelectItem value="Safety">Safety</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Regulatory">Regulatory</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.department}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, department: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Departments">All Departments</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="Human Resources">Human Resources</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Safety">Safety</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.language}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, language: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Languages">All Languages</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ml">Malayalam</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Results */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Searching documents...</p>
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No documents found</p>
              <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
            </div>
          )}

          {results.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{result.title}</CardTitle>
                  <Badge variant={result.language === "ml" ? "secondary" : "outline"}>
                    {result.language === "ml" ? "മലയാളം" : "English"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-2">{result.content}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {result.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {result.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(result.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="secondary">{result.category}</Badge>
                    <Badge variant="outline">{result.department}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

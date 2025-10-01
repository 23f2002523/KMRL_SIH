"use client"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, MoreHorizontal, Download, Eye, Edit, Trash2, Clock, User } from "lucide-react"
import type { Document } from "@/lib/database"

interface DocumentCardProps {
  document: Document
  language: "en" | "ml"
  onView?: (document: Document) => void
  onEdit?: (document: Document) => void
  onDelete?: (document: Document) => void
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  classified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function DocumentCard({ document, language, onView, onEdit, onDelete }: DocumentCardProps) {
  const title = language === "ml" && document.malayalam_title ? document.malayalam_title : document.title
  const description =
    language === "ml" && document.malayalam_description ? document.malayalam_description : document.description

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return language === "en"
      ? date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : date.toLocaleDateString("ml-IN", { year: "numeric", month: "short", day: "numeric" })
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

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-balance">{title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={statusColors[document.status]} variant="secondary">
                  {getStatusText(document.status)}
                </Badge>
                <Badge className={priorityColors[document.priority]} variant="outline">
                  {getPriorityText(document.priority)}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(document)}>
                <Eye className="mr-2 h-4 w-4" />
                {language === "en" ? "View" : "കാണുക"}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                {language === "en" ? "Download" : "ഡൗൺലോഡ്"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(document)}>
                <Edit className="mr-2 h-4 w-4" />
                {language === "en" ? "Edit" : "എഡിറ്റ്"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(document)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                {language === "en" ? "Delete" : "ഇല്ലാതാക്കുക"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {description && <p className="text-sm text-muted-foreground line-clamp-2 text-pretty mb-3">{description}</p>}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(document.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{document.file_name}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src="/placeholder.svg?height=24&width=24" />
              <AvatarFallback className="text-xs">U</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {language === "en" ? "Uploaded by User" : "ഉപയോക്താവ് അപ്‌ലോഡ് ചെയ്തത്"}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onView?.(document)}>
            {language === "en" ? "View Details" : "വിശദാംശങ്ങൾ"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

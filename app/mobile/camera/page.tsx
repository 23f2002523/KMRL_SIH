"use client"

import { useState } from "react"
import { MobileLayout } from "@/components/mobile/mobile-layout"
import { CameraCapture } from "@/components/mobile/camera-capture"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Upload } from "lucide-react"

export default function MobileCameraPage() {
  const [language, setLanguage] = useState<"en" | "ml">("en")
  const [recentCaptures, setRecentCaptures] = useState<any[]>([])

  const handleCapture = (imageData: string, metadata: any) => {
    const newCapture = {
      id: Date.now().toString(),
      imageData,
      metadata,
      status: "processing",
      timestamp: new Date().toISOString(),
    }

    setRecentCaptures((prev) => [newCapture, ...prev.slice(0, 4)])

    // Simulate processing
    setTimeout(() => {
      setRecentCaptures((prev) =>
        prev.map((capture) => (capture.id === newCapture.id ? { ...capture, status: "completed" } : capture)),
      )
    }, 3000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Upload className="h-4 w-4 text-blue-600" />
    }
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      en: {
        processing: "Processing",
        completed: "Completed",
        uploaded: "Uploaded",
      },
      ml: {
        processing: "പ്രോസസ്സിംഗ്",
        completed: "പൂർത്തിയായി",
        uploaded: "അപ്‌ലോഡ് ചെയ്തു",
      },
    }
    return statusMap[language][status as keyof typeof statusMap.en] || status
  }

  return (
    <MobileLayout language={language} onLanguageChange={setLanguage}>
      <div className="p-4 space-y-6">
        {/* Page Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-balance mb-2">{language === "en" ? "Document Camera" : "രേഖ ക്യാമറ"}</h1>
          <p className="text-muted-foreground text-pretty">
            {language === "en" ? "Capture and process documents instantly" : "രേഖകൾ തൽക്ഷണം ക്യാപ്ചർ ചെയ്ത് പ്രോസസ്സ് ചെയ്യുക"}
          </p>
        </div>

        {/* Camera Capture Component */}
        <CameraCapture language={language} onCapture={handleCapture} />

        {/* Recent Captures */}
        {recentCaptures.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{language === "en" ? "Recent Captures" : "സമീപകാല ക്യാപ്ചറുകൾ"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCaptures.map((capture) => (
                  <div key={capture.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-12 h-12 bg-background rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={capture.imageData || "/placeholder.svg"}
                        alt="Captured document"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {capture.metadata.title || (language === "en" ? "Untitled Document" : "പേരില്ലാത്ത രേഖ")}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {getStatusIcon(capture.status)}
                          <span className="text-xs">{getStatusText(capture.status)}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(capture.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  )
}

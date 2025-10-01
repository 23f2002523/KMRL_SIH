"use client"

import { useState, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Camera, Mail, Share2, CheckCircle } from "lucide-react"

export default function UploadPage() {
  const [language, setLanguage] = useState<"en" | "ml">("en")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadComplete(true)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }, [])

  const uploadMethods = {
    en: [
      { title: "File Upload", description: "Upload documents from your device", icon: Upload, color: "bg-blue-500" },
      { title: "Camera Capture", description: "Take photos of documents", icon: Camera, color: "bg-green-500" },
      { title: "Email Integration", description: "Import from email attachments", icon: Mail, color: "bg-orange-500" },
      { title: "SharePoint", description: "Connect to SharePoint documents", icon: Share2, color: "bg-purple-500" },
    ],
    ml: [
      {
        title: "ഫയൽ അപ്‌ലോഡ്",
        description: "നിങ്ങളുടെ ഉപകരണത്തിൽ നിന്ന് രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക",
        icon: Upload,
        color: "bg-blue-500",
      },
      { title: "ക്യാമറ ക്യാപ്ചർ", description: "രേഖകളുടെ ഫോട്ടോകൾ എടുക്കുക", icon: Camera, color: "bg-green-500" },
      {
        title: "ഇമെയിൽ ഇന്റഗ്രേഷൻ",
        description: "ഇമെയിൽ അറ്റാച്ച്മെന്റുകളിൽ നിന്ന് ഇമ്പോർട്ട് ചെയ്യുക",
        icon: Mail,
        color: "bg-orange-500",
      },
      { title: "ഷെയർപോയിന്റ്", description: "ഷെയർപോയിന്റ് രേഖകളിലേക്ക് കണക്റ്റ് ചെയ്യുക", icon: Share2, color: "bg-purple-500" },
    ],
  }

  return (
    <DashboardLayout language={language} onLanguageChange={setLanguage}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{language === "en" ? "Upload Documents" : "രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക"}</h1>
          <p className="text-muted-foreground">
            {language === "en"
              ? "Upload and process documents from multiple sources"
              : "ഒന്നിലധികം സ്രോതസ്സുകളിൽ നിന്ന് രേഖകൾ അപ്‌ലോഡ് ചെയ്ത് പ്രോസസ്സ് ചെയ്യുക"}
          </p>
        </div>

        {/* Upload Methods */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {uploadMethods[language].map((method, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <method.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{method.title}</h3>
                <p className="text-sm text-muted-foreground text-pretty">{method.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* File Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>{language === "en" ? "Upload Document" : "രേഖ അപ്‌ലോഡ് ചെയ്യുക"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Drop Zone */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === "en"
                  ? "Drop files here or click to browse"
                  : "ഫയലുകൾ ഇവിടെ ഡ്രോപ്പ് ചെയ്യുക അല്ലെങ്കിൽ ബ്രൗസ് ചെയ്യാൻ ക്ലിക്ക് ചെയ്യുക"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === "en"
                  ? "Supports PDF, DOC, DOCX, JPG, PNG files up to 10MB"
                  : "10MB വരെയുള്ള PDF, DOC, DOCX, JPG, PNG ഫയലുകൾ പിന്തുണയ്ക്കുന്നു"}
              </p>
              <Input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer bg-transparent">
                  <Upload className="mr-2 h-4 w-4" />
                  {language === "en" ? "Choose Files" : "ഫയലുകൾ തിരഞ്ഞെടുക്കുക"}
                </Button>
              </Label>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{language === "en" ? "Uploading..." : "അപ്‌ലോഡ് ചെയ്യുന്നു..."}</span>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Upload Complete */}
            {uploadComplete && (
              <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  {language === "en" ? "Upload completed successfully!" : "അപ്‌ലോഡ് വിജയകരമായി പൂർത്തിയായി!"}
                </span>
              </div>
            )}

            {/* Document Metadata */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{language === "en" ? "Document Title" : "രേഖയുടെ ശീർഷകം"}</Label>
                <Input placeholder={language === "en" ? "Enter document title" : "രേഖയുടെ ശീർഷകം നൽകുക"} />
              </div>
              <div className="space-y-2">
                <Label>{language === "en" ? "Category" : "വിഭാഗം"}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "en" ? "Select category" : "വിഭാഗം തിരഞ്ഞെടുക്കുക"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safety">{language === "en" ? "Safety" : "സുരക്ഷ"}</SelectItem>
                    <SelectItem value="hr">{language === "en" ? "HR" : "HR"}</SelectItem>
                    <SelectItem value="engineering">{language === "en" ? "Engineering" : "എഞ്ചിനീയറിംഗ്"}</SelectItem>
                    <SelectItem value="regulatory">{language === "en" ? "Regulatory" : "നിയന്ത്രണം"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === "en" ? "Priority" : "മുൻഗണന"}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "en" ? "Select priority" : "മുൻഗണന തിരഞ്ഞെടുക്കുക"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{language === "en" ? "Low" : "കുറഞ്ഞത്"}</SelectItem>
                    <SelectItem value="medium">{language === "en" ? "Medium" : "ഇടത്തരം"}</SelectItem>
                    <SelectItem value="high">{language === "en" ? "High" : "ഉയർന്നത്"}</SelectItem>
                    <SelectItem value="urgent">{language === "en" ? "Urgent" : "അടിയന്തിരം"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === "en" ? "Department" : "വകുപ്പ്"}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "en" ? "Select department" : "വകുപ്പ് തിരഞ്ഞെടുക്കുക"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operations">{language === "en" ? "Operations" : "പ്രവർത്തനങ്ങൾ"}</SelectItem>
                    <SelectItem value="maintenance">{language === "en" ? "Maintenance" : "അറ്റകുറ്റപ്പണി"}</SelectItem>
                    <SelectItem value="safety">{language === "en" ? "Safety" : "സുരക്ഷ"}</SelectItem>
                    <SelectItem value="hr">{language === "en" ? "Human Resources" : "മാനവ വിഭവശേഷി"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{language === "en" ? "Description" : "വിവരണം"}</Label>
              <Textarea
                placeholder={language === "en" ? "Enter document description" : "രേഖയുടെ വിവരണം നൽകുക"}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button className="flex-1">{language === "en" ? "Process Document" : "രേഖ പ്രോസസ്സ് ചെയ്യുക"}</Button>
              <Button variant="outline">{language === "en" ? "Save Draft" : "ഡ്രാഫ്റ്റ് സേവ് ചെയ്യുക"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

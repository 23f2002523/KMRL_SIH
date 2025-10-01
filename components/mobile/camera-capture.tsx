"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, RotateCcw, X, Upload, FileText, Zap, ImageIcon, Loader2 } from "lucide-react"

interface CameraCaptureProps {
  language: "en" | "ml"
  onCapture?: (imageData: string, metadata: any) => void
}

export function CameraCapture({ language, onCapture }: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [documentTitle, setDocumentTitle] = useState("")
  const [documentDescription, setDocumentDescription] = useState("")
  const [documentCategory, setDocumentCategory] = useState("")
  const [documentPriority, setDocumentPriority] = useState("medium")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCapturing(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert(
        language === "en"
          ? "Unable to access camera. Please check permissions."
          : "ക്യാമറ ആക്സസ് ചെയ്യാൻ കഴിയുന്നില്ല. അനുമതികൾ പരിശോധിക്കുക.",
      )
    }
  }, [language])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCapturing(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedImage(imageData)
        stopCamera()
      }
    }
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const processDocument = useCallback(async () => {
    if (!capturedImage) return

    setIsProcessing(true)

    try {
      // TODO: Implement actual OCR and AI processing
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const metadata = {
        title: documentTitle,
        description: documentDescription,
        category: documentCategory,
        priority: documentPriority,
        source_type: "mobile_camera",
        captured_at: new Date().toISOString(),
      }

      onCapture?.(capturedImage, metadata)

      // Reset form
      setCapturedImage(null)
      setDocumentTitle("")
      setDocumentDescription("")
      setDocumentCategory("")
      setDocumentPriority("medium")
    } catch (error) {
      console.error("Error processing document:", error)
      alert(
        language === "en"
          ? "Error processing document. Please try again."
          : "രേഖ പ്രോസസ്സ് ചെയ്യുന്നതിൽ പിശക്. വീണ്ടും ശ്രമിക്കുക.",
      )
    } finally {
      setIsProcessing(false)
    }
  }, [capturedImage, documentTitle, documentDescription, documentCategory, documentPriority, onCapture, language])

  const categories = {
    en: [
      { value: "POLICY", label: "Policy Documents" },
      { value: "SAFETY_RPT", label: "Safety Reports" },
      { value: "TECH_SPEC", label: "Technical Specifications" },
      { value: "FIN_RPT", label: "Financial Reports" },
      { value: "COMPLIANCE", label: "Regulatory Compliance" },
      { value: "EMP_REC", label: "Employee Records" },
      { value: "MAINT_LOG", label: "Maintenance Logs" },
      { value: "CORRESP", label: "Correspondence" },
    ],
    ml: [
      { value: "POLICY", label: "നയ രേഖകൾ" },
      { value: "SAFETY_RPT", label: "സുരക്ഷാ റിപ്പോർട്ടുകൾ" },
      { value: "TECH_SPEC", label: "സാങ്കേതിക വിവരണങ്ങൾ" },
      { value: "FIN_RPT", label: "സാമ്പത്തിക റിപ്പോർട്ടുകൾ" },
      { value: "COMPLIANCE", label: "നിയന്ത്രണ അനുസരണം" },
      { value: "EMP_REC", label: "ജീവനക്കാരുടെ രേഖകൾ" },
      { value: "MAINT_LOG", label: "അറ്റകുറ്റപ്പണി രേഖകൾ" },
      { value: "CORRESP", label: "കത്തിടപാടുകൾ" },
    ],
  }

  const priorities = {
    en: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ],
    ml: [
      { value: "low", label: "കുറഞ്ഞത്" },
      { value: "medium", label: "ഇടത്തരം" },
      { value: "high", label: "ഉയർന്നത്" },
      { value: "urgent", label: "അടിയന്തിരം" },
    ],
  }

  return (
    <div className="space-y-4">
      {!capturedImage ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {language === "en" ? "Capture Document" : "രേഖ ക്യാപ്ചർ ചെയ്യുക"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isCapturing ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <Button onClick={startCamera} className="h-12">
                    <Camera className="mr-2 h-5 w-5" />
                    {language === "en" ? "Open Camera" : "ക്യാമറ തുറക്കുക"}
                  </Button>

                  <div className="relative">
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-12 w-full">
                      <ImageIcon className="mr-2 h-5 w-5" />
                      {language === "en" ? "Choose from Gallery" : "ഗാലറിയിൽ നിന്ന് തിരഞ്ഞെടുക്കുക"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">
                    {language === "en" ? "Tips for better capture:" : "മികച്ച ക്യാപ്ചറിനുള്ള നുറുങ്ങുകൾ:"}
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {language === "en" ? "Ensure good lighting" : "നല്ല വെളിച്ചം ഉറപ്പാക്കുക"}</li>
                    <li>• {language === "en" ? "Keep document flat and straight" : "രേഖ പരന്നതും നേരായതും ആക്കുക"}</li>
                    <li>• {language === "en" ? "Fill the frame with the document" : "രേഖ കൊണ്ട് ഫ്രെയിം നിറയ്ക്കുക"}</li>
                    <li>• {language === "en" ? "Avoid shadows and glare" : "നിഴലുകളും തിളക്കവും ഒഴിവാക്കുക"}</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-dashed border-white/50 m-4 rounded-lg pointer-events-none" />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={stopCamera} className="flex-1 bg-transparent">
                    <X className="mr-2 h-4 w-4" />
                    {language === "en" ? "Cancel" : "റദ്ദാക്കുക"}
                  </Button>
                  <Button onClick={capturePhoto} className="flex-1">
                    <Camera className="mr-2 h-4 w-4" />
                    {language === "en" ? "Capture" : "ക്യാപ്ചർ"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Captured Image Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {language === "en" ? "Document Preview" : "രേഖ പ്രിവ്യൂ"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured document"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={retakePhoto} className="flex-1 bg-transparent">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {language === "en" ? "Retake" : "വീണ്ടും എടുക്കുക"}
                  </Button>
                  <Badge variant="secondary" className="px-3 py-1">
                    <Zap className="mr-1 h-3 w-3" />
                    {language === "en" ? "AI Ready" : "AI തയ്യാർ"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Information Form */}
          <Card>
            <CardHeader>
              <CardTitle>{language === "en" ? "Document Information" : "രേഖയുടെ വിവരങ്ങൾ"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{language === "en" ? "Document Title" : "രേഖയുടെ ശീർഷകം"}</Label>
                <Input
                  id="title"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder={language === "en" ? "Enter document title..." : "രേഖയുടെ ശീർഷകം നൽകുക..."}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{language === "en" ? "Description (Optional)" : "വിവരണം (ഓപ്ഷണൽ)"}</Label>
                <Textarea
                  id="description"
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  placeholder={language === "en" ? "Brief description..." : "ഹ്രസ്വ വിവരണം..."}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Category" : "വിഭാഗം"}</Label>
                  <Select value={documentCategory} onValueChange={setDocumentCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === "en" ? "Select category" : "വിഭാഗം തിരഞ്ഞെടുക്കുക"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories[language].map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{language === "en" ? "Priority" : "മുൻഗണന"}</Label>
                  <Select value={documentPriority} onValueChange={setDocumentPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities[language].map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={processDocument}
                disabled={isProcessing || !documentTitle.trim()}
                className="w-full h-12"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === "en" ? "Processing..." : "പ്രോസസ്സിംഗ്..."}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {language === "en" ? "Process & Upload" : "പ്രോസസ്സ് ചെയ്ത് അപ്‌ലോഡ് ചെയ്യുക"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

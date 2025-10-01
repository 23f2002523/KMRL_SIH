"use client"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

interface LanguageToggleProps {
  currentLanguage: "en" | "ml"
  onLanguageChange: (language: "en" | "ml") => void
}

export function LanguageToggle({ currentLanguage, onLanguageChange }: LanguageToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onLanguageChange(currentLanguage === "en" ? "ml" : "en")}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="text-sm font-medium">{currentLanguage === "en" ? "മലയാളം" : "English"}</span>
    </Button>
  )
}

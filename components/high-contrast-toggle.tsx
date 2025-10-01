"use client"

import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useHighContrast } from "@/hooks/use-high-contrast"

export function HighContrastToggle() {
  const { isHighContrast, toggleHighContrast } = useHighContrast()
  const { t } = useLanguage()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleHighContrast}
      className="navbar-glow"
      aria-label={isHighContrast ? t("accessibility.disableHighContrast") : t("accessibility.enableHighContrast")}
      title={isHighContrast ? t("accessibility.disableHighContrast") : t("accessibility.enableHighContrast")}
    >
      {isHighContrast ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </Button>
  )
}
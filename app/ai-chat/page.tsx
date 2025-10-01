"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AiChatWidget } from "@/components/ai-chat-widget"

export default function AiChatPage() {
  const [language, setLanguage] = useState<"en" | "ml">("en")

  return (
    <DashboardLayout language={language} onLanguageChange={setLanguage}>
      <div className="h-full">
        <AiChatWidget language={language} />
      </div>
    </DashboardLayout>
  )
}

"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { KnowledgeGraph } from "@/components/knowledge-graph"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AnalyticsPage() {
  const [language, setLanguage] = useState<"en" | "ml">("en")

  return (
    <DashboardLayout language={language} onLanguageChange={setLanguage}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{language === "en" ? "Analytics & Insights" : "അനലിറ്റിക്സും ഇൻസൈറ്റുകളും"}</h1>
          <p className="text-muted-foreground">
            {language === "en"
              ? "Monitor document processing performance and explore knowledge relationships"
              : "രേഖ പ്രോസസ്സിംഗ് പ്രകടനം നിരീക്ഷിക്കുകയും അറിവിന്റെ ബന്ധങ്ങൾ പര്യവേക്ഷണം ചെയ്യുകയും ചെയ്യുക"}
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">{language === "en" ? "Dashboard" : "ഡാഷ്ബോർഡ്"}</TabsTrigger>
            <TabsTrigger value="knowledge-graph">{language === "en" ? "Knowledge Graph" : "നോളജ് ഗ്രാഫ്"}</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AnalyticsDashboard language={language} />
          </TabsContent>

          <TabsContent value="knowledge-graph">
            <KnowledgeGraph language={language} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { ToastProvider } from "@/components/ui/toast-provider"
import { HighContrastProvider } from "@/hooks/use-high-contrast"
import { LanguageProvider } from "@/hooks/use-language"
import { AuthProvider } from "@/hooks/use-auth"
import { ErrorBoundary } from "@/components/error-boundary"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "KMRL Train Management System",
  description: "Intelligent Document Management System for Kochi Metro Rail Limited",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <ErrorBoundary>
            <ThemeProvider>
              <HighContrastProvider>
                <LanguageProvider>
                  <AuthProvider>
                    {children}
                    <ToastProvider />
                  </AuthProvider>
                </LanguageProvider>
              </HighContrastProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}

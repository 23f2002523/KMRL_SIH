"use client"

import { LandingPage } from "@/components/landing-page"

export default function HomePage() {
  // Always show landing page - no automatic redirects
  // User flow: Landing Page → Get Started → Login → Dashboard
  return <LandingPage />
}

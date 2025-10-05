"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Play, ArrowRight } from 'lucide-react'
import { AnimatedBackground } from '@/components/animated-background'
import Image from 'next/image'

export function LandingPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    // Always go to login page first - proper user flow
    router.push('/login')
  }

  const handleWatchDemo = () => {
    // For now, just show an alert - you can implement demo video later
    alert('Demo video coming soon! For now, try the live system with:\nEmail: operator@kmrl.co.in\nPassword: password123')
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Standardized 3D Network Animation Background */}
      <AnimatedBackground />

      {/* Logo in upper left corner */}
      <div className="fixed top-0 left-0 z-50 -mt-12 -ml-12">
        <Image 
          src="/MetroMind.png" 
          alt="MetroMind Logo" 
          width={240} 
          height={80} 
          className="drop-shadow-lg"
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent mb-6 drop-shadow-2xl animate-pulse">
            MetroMind AI
          </h1>

          {/* Subtitle */}
          <h2 className="text-xl md:text-2xl font-semibold text-gray-300 mb-4 drop-shadow-lg">
            A Smart Automation System
          </h2>

          {/* Description */}
          <h3 className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            Empowering Kerala Metro with AI-driven automation, real-time monitoring, 
            and smart decision-making for seamless urban transportation.
          </h3>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {/* Get Started Button */}
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 px-8 rounded-full shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 group"
            >
              <span className="mr-2">Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>

            {/* Watch Demo Button */}
            <Button
              onClick={handleWatchDemo}
              variant="outline"
              size="lg"
              className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 font-semibold py-4 px-8 rounded-full shadow-2xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105 group backdrop-blur-sm"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
              <span>Watch Demo</span>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
            <p className="drop-shadow-md">
              Revolutionizing urban transportation with AI-powered train management, 
              real-time monitoring, and intelligent automation for the Kerala Metro Rail Limited.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
    </div>
  )
}
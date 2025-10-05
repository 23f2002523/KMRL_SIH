"use client"

import { useAuth } from '@/hooks/use-auth'
import { AuthForm } from '@/components/auth-form'
import { useRouter } from 'next/navigation'
import { Loader2, Heart } from 'lucide-react'
import Image from 'next/image'
import { AnimatedBackground } from '@/components/animated-background'

export default function LoginPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="flex flex-col items-center space-y-4 relative z-20">
          <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
          <p className="text-sm text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      <div className="w-full max-w-md relative z-20">
        <div className="text-center mb-8 backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl">
          <div className="mx-auto w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg overflow-hidden">
            <Image 
              src="/MetroMind.png" 
              alt="MetroMind AI Logo" 
              width={64} 
              height={64} 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">
            MetroMind AI
          </h1>
          <p className="text-sm text-gray-300 mt-2 drop-shadow-sm">
            A smart automation system for Kochi Metro
          </p>
        </div>

        <AuthForm 
          onSuccess={(user) => {
            console.log('LoginPage - onSuccess called with user:', user)
            if (user?.role === 'Operator') {
              console.log('LoginPage - User authenticated, waiting for state update before redirect')
              // Wait longer to ensure auth state is fully updated
              setTimeout(() => {
                console.log('LoginPage - Redirecting to operator dashboard')
                router.push('/operator/dashboard')
              }, 500)
            } else {
              console.log('LoginPage - Redirecting to home page')
              setTimeout(() => {
                router.push('/')
              }, 500)
            }
          }} 
        />

        <div className="mt-8 text-center backdrop-blur-sm bg-white/5 dark:bg-black/5 rounded-xl p-3 border border-white/10 dark:border-white/5">
          <p className="text-xs text-gray-400 drop-shadow-sm flex items-center justify-center gap-1">
            Made by MetroMind with <Heart className="w-3 h-3 text-red-400" fill="currentColor" />  {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface AuthFormProps {
  onSuccess?: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  const resetForm = () => {
    setLoginData({ email: '', password: '' })
    setError('')
    setSuccess('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    const result = await login(loginData.email, loginData.password)
    
    if (result.success) {
      setSuccess('Login successful!')
      setTimeout(() => {
        onSuccess?.()
      }, 1000)
    } else {
      setError(result.error || 'Login failed')
    }
    
    setIsLoading(false)
  }



  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">KMRL Authentication</CardTitle>
        <CardDescription className="text-center">
          Sign in to access the Train Management System
          <br />
          <span className="text-xs text-amber-600 font-medium">
            Admin and Operator access only
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="admin@kmrl.co.in"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
              aria-label="Email address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                aria-label="Password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-teal-600 hover:bg-teal-700"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
        
        {/* Error/Success Messages */}
        {error && (
          <Alert className="mt-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
        <div className="grid grid-cols-1 gap-2 w-full">
          <p className="text-xs font-medium text-gray-700">Demo Credentials:</p>
          <div className="flex justify-center space-x-4 text-xs">
            <div className="text-center">
              <span className="block px-2 py-1 bg-blue-100 text-blue-800 rounded mb-1">Admin</span>
              <code className="text-xs">admin@kmrl.co.in</code>
            </div>
            <div className="text-center">
              <span className="block px-2 py-1 bg-green-100 text-green-800 rounded mb-1">Operator</span>
              <code className="text-xs">operator@kmrl.co.in</code>
            </div>
          </div>
          <p className="text-xs text-gray-600">Password: <code>password123</code></p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Contact system administrator for account access
        </p>
      </CardFooter>
    </Card>
  )
}
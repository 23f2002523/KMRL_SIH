"use client"

import { useApiClient } from "@/hooks/use-api-client"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { ErrorBoundary } from "@/components/error-boundary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, X, RefreshCw } from "lucide-react"

function ErrorTestComponent() {
  const apiClient = useApiClient()
  const { handleError, handleSuccess } = useErrorHandler()

  const triggerJSError = () => {
    throw new Error("This is a test JavaScript error!")
  }

  const triggerNetworkError = async () => {
    try {
      await apiClient.get('/api/nonexistent-endpoint')
    } catch (error) {
      // Error is already handled by apiClient
    }
  }

  const triggerValidationError = async () => {
    try {
      await apiClient.post('/api/auth/login', {
        email: '',  // Invalid email
        password: '' // Invalid password
      })
    } catch (error) {
      // Error is already handled by apiClient
    }
  }

  const triggerCustomError = () => {
    handleError('This is a custom error message', {
      showToast: true,
      fallbackMessage: 'Custom error occurred'
    })
  }

  const triggerSuccess = () => {
    handleSuccess('Operation completed successfully!', 'Everything worked as expected.')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Error Handling Test Page</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test different types of errors and success messages
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-500" />
              Error Tests
            </CardTitle>
            <CardDescription>
              Click these buttons to test different error scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={triggerJSError}
              variant="destructive"
              className="w-full"
            >
              Trigger JavaScript Error
            </Button>
            
            <Button 
              onClick={triggerNetworkError}
              variant="destructive"
              className="w-full"
            >
              Trigger 404 Network Error
            </Button>
            
            <Button 
              onClick={triggerValidationError}
              variant="destructive"
              className="w-full"
            >
              Trigger Validation Error
            </Button>
            
            <Button 
              onClick={triggerCustomError}
              variant="destructive"
              className="w-full"
            >
              Trigger Custom Error
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Success Tests
            </CardTitle>
            <CardDescription>
              Test success notifications and logging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={triggerSuccess}
              variant="default"
              className="w-full"
            >
              Trigger Success Message
            </Button>
            
            <Button 
              onClick={() => window.open('/api/logs', '_blank')}
              variant="outline"
              className="w-full"
            >
              View API Logs
            </Button>
            
            <Button 
              onClick={() => window.open('/api/logs?errors=true', '_blank')}
              variant="outline"
              className="w-full"
            >
              View Error Logs Only
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Error Handling Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Frontend Error Handling</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>✅ Toast notifications for errors</li>
                <li>✅ React Error Boundaries</li>
                <li>✅ API client with error handling</li>
                <li>✅ Custom error hook</li>
                <li>✅ Success message system</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Backend Logging</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>✅ Request/Response logging</li>
                <li>✅ Error tracking</li>
                <li>✅ Performance monitoring</li>
                <li>✅ User activity tracking</li>
                <li>✅ Log viewing API</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ErrorTestPage() {
  return (
    <ErrorBoundary>
      <ErrorTestComponent />
    </ErrorBoundary>
  )
}
"use client"

import { useAuth } from '@/hooks/use-auth'
import { RoleBadge } from '@/hooks/use-role-access'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft, Mail, Shield, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AccessDeniedPage() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-800 dark:text-red-200 flex items-center justify-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Access Restricted
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-300 text-lg">
              You don't have permission to access this resource
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* User Info */}
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Your Current Access Level</h3>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    <strong>Name:</strong> {user?.name || 'Not logged in'}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    <strong>Email:</strong> {user?.email || 'N/A'}
                  </p>
                </div>
                {user?.role && (
                  <RoleBadge role={user.role} size="lg" />
                )}
              </div>
            </div>

            {/* Role Information */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Viewer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs text-green-600 dark:text-green-300 space-y-1">
                    <li>• View train data</li>
                    <li>• Read documents</li>
                    <li>• Basic analytics</li>
                    <li>• AI chat</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Operator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                    <li>• Control trains</li>
                    <li>• Manage documents</li>
                    <li>• Create alerts</li>
                    <li>• Full AI features</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Admin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs text-purple-600 dark:text-purple-300 space-y-1">
                    <li>• Full system access</li>
                    <li>• User management</li>
                    <li>• System configuration</li>
                    <li>• All features</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => router.back()}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <Button 
                onClick={() => router.push('/overview')}
                variant="default"
                className="flex-1"
              >
                Return to Dashboard
              </Button>
              
              <Button 
                onClick={() => window.location.href = 'mailto:admin@kmrl.co.in?subject=Access Request&body=I would like to request higher access privileges for my account.'}
                variant="secondary"
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Request Access
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center pt-4 border-t border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                If you believe this is an error, please contact your system administrator or{' '}
                <a href="mailto:admin@kmrl.co.in" className="underline hover:text-red-800 dark:hover:text-red-200">
                  admin@kmrl.co.in
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
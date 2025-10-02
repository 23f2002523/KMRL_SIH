'use client'

import { useAuth } from '@/hooks/use-auth'

export default function DebugAuth() {
  const { user } = useAuth()

  const testUploadAuth = async () => {
    console.log('Testing upload auth...')
    
    // Check if token exists in cookies
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]
    
    console.log('Token in cookies:', token ? 'Yes' : 'No')
    console.log('User:', user)
    console.log('All cookies:', document.cookie)
    
    // Test with fetch using cookies
    try {
      const response = await fetch('/api/operator/documents', {
        method: 'GET',
        credentials: 'include', // Include cookies
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
    } catch (error) {
      console.error('Test error:', error)
    }
  }

  return (
    <div className="p-4 border border-gray-200 rounded">
      <h3 className="font-medium mb-2">Debug Authentication</h3>
      <p className="text-sm text-gray-600 mb-4">
        User: {user?.name} ({user?.email}) - Role: {user?.role}
      </p>
      <button
        onClick={testUploadAuth}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Test Upload Auth
      </button>
    </div>
  )
}
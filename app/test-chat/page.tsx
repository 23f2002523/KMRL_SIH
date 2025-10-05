'use client'

import { useState } from 'react'

export default function TestChatPage() {
  const [testMessage, setTestMessage] = useState('')

  const testChatbot = async () => {
    try {
      console.log('Testing chatbot API...')
      
      const formData = new FormData()
      formData.append('message', 'Hello test')
      formData.append('messageId', 'test_123')
      formData.append('language', 'en')

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Response data:', data)
        setTestMessage('✅ API Response: ' + data.response)
      } else {
        const errorText = await response.text()
        console.log('Error response:', errorText)
        setTestMessage('❌ Error: ' + response.status + ' - ' + errorText)
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setTestMessage('❌ Network Error: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Chatbot Test Page</h1>
      
      <div className="space-y-4">
        <button
          onClick={testChatbot}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Chatbot API
        </button>
        
        {testMessage && (
          <div className="p-4 border rounded bg-gray-50">
            <pre>{JSON.stringify(testMessage, null, 2)}</pre>
          </div>
        )}
        
        <div className="p-4 border rounded bg-yellow-50">
          <h3 className="font-bold">Debug Info:</h3>
          <p>• Login page पर chatbot hide होना चाहिए</p>
          <p>• अन्य pages पर chatbot दिखना चाहिए</p>
          <p>• Click करने पर chat window open होना चाहिए</p>
        </div>
      </div>
    </div>
  )
}
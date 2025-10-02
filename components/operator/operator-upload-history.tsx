'use client'

import { useState, useEffect } from 'react'
import { DocumentIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface UploadedDocument {
  documentId: number
  fileName: string
  fileType: string
  fileSize: number
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed'
  recordsProcessed: number | null
  errorMessage: string | null
  createdAt: string
  uploadedBy: string
}

export default function OperatorUploadHistory() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/operator/documents')
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()
      setDocuments(data.documents || [])
      setError(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'failed':
        return 'Failed'
      case 'processing':
        return 'Processing'
      default:
        return 'Pending'
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType === 'pdf') return '📄'
    if (fileType === 'excel') return '📊'
    if (fileType === 'csv') return '📈'
    return '📄'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading documents...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Documents</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchDocuments}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Upload History ({documents.length})
        </h3>
        <button
          onClick={fetchDocuments}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <DocumentIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No documents uploaded yet</p>
          <p className="text-sm">Upload your first document to get started</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <li key={doc.documentId} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <span className="text-2xl">
                      {getFileIcon(doc.fileType)}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.fileName}
                      </p>
                      <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{doc.fileType.toUpperCase()}</span>
                        <span>•</span>
                        <span>Uploaded by {doc.uploadedBy}</span>
                        {doc.recordsProcessed && (
                          <>
                            <span>•</span>
                            <span>{doc.recordsProcessed} records processed</span>
                          </>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(doc.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(doc.processingStatus)}
                      <span className={`text-sm font-medium ${
                        doc.processingStatus === 'completed' ? 'text-green-600' :
                        doc.processingStatus === 'failed' ? 'text-red-600' :
                        doc.processingStatus === 'processing' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {getStatusText(doc.processingStatus)}
                      </span>
                    </div>
                  </div>
                </div>

                {doc.errorMessage && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                    <strong>Error:</strong> {doc.errorMessage}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
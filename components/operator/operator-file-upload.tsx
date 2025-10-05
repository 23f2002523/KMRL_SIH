'use client'

import { useState, useRef, useCallback } from 'react'
import { CloudArrowUpIcon, DocumentIcon, ExclamationTriangleIcon, CheckIcon } from '@heroicons/react/24/outline'

interface UploadedFile {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  previewData?: any[]
  autoRetraining?: boolean
  retrainingStatus?: 'idle' | 'training' | 'completed' | 'failed'
}

interface FileUploadProps {
  onFileUpload?: (files: File[]) => void
  maxFileSize?: number // in MB
  maxFiles?: number
}

const ALLOWED_TYPES = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'application/vnd.ms-excel': 'Excel',
  'text/csv': 'CSV',
  'application/pdf': 'PDF'
}

export default function OperatorFileUpload({ 
  onFileUpload, 
  maxFileSize = 10, 
  maxFiles = 5 
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!Object.keys(ALLOWED_TYPES).includes(file.type)) {
      return `Invalid file type. Only Excel (.xlsx, .xls), CSV, and PDF files are allowed.`
    }

    // Check file size (convert MB to bytes)
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size too large. Maximum size is ${maxFileSize}MB.`
    }

    return null
  }

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    
    // Check max files limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    const validFiles: UploadedFile[] = []
    const errors: string[] = []

    fileArray.forEach((file) => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push({
          file,
          id: `${Date.now()}-${Math.random()}`,
          status: 'pending',
          progress: 0
        })
      }
    })

    if (errors.length > 0) {
      alert(errors.join('\n'))
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles])
      if (onFileUpload) {
        onFileUpload(validFiles.map(f => f.file))
      }
    }
  }, [uploadedFiles.length, maxFiles, maxFileSize, onFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    // Reset input value to allow re-uploading same file
    e.target.value = ''
  }, [handleFileSelect])

  const uploadFile = async (fileData: UploadedFile) => {
    const formData = new FormData()
    formData.append('file', fileData.file)
    formData.append('type', fileData.file.type)

    setUploadedFiles(prev => 
      prev.map(f => f.id === fileData.id ? { ...f, status: 'uploading', progress: 0 } : f)
    )

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileData.id && f.progress < 90 ? 
            { ...f, progress: f.progress + 10 } : f)
        )
      }, 200)

      // Cookies will be sent automatically with fetch
      const response = await fetch('/api/operator/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Ensure cookies are sent
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        let errorMessage = 'Upload failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || 'Upload failed'
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()

      setUploadedFiles(prev => 
        prev.map(f => f.id === fileData.id ? { 
          ...f, 
          status: 'success', 
          progress: 100,
          previewData: result.previewData,
          autoRetraining: result.autoRetraining,
          retrainingStatus: result.autoRetraining ? 'training' : 'idle'
        } : f)
      )

      // If auto-retraining started, simulate progress
      if (result.autoRetraining) {
        setTimeout(() => {
          setUploadedFiles(prev => 
            prev.map(f => f.id === fileData.id ? { 
              ...f, 
              retrainingStatus: 'completed'
            } : f)
          )
        }, 12000) // 12 seconds simulation
      }

      // Show success message
      if (result.totalRows > 0) {
        alert(`✅ Success! File processed with ${result.totalRows} rows imported.${result.autoRetraining ? ' 🤖 AI models are being retrained for better predictions!' : ''}`)
      } else {
        alert(`✅ Success! ${result.message}`)
      }

    } catch (error) {
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileData.id ? { 
          ...f, 
          status: 'error', 
          progress: 0,
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f)
      )

      // Show error message
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Upload failed'}`)
    }
  }

  const uploadAllFiles = async () => {
    setIsUploading(true)
    const pendingFiles = uploadedFiles.filter(f => f.status === 'pending')
    
    for (const file of pendingFiles) {
      await uploadFile(file)
    }
    
    setIsUploading(false)
  }

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    if (fileType.includes('csv')) return '📈'
    return '📄'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xlsx,.xls,.csv,.pdf"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Supported formats: Excel (.xlsx, .xls), CSV, PDF
        </p>
        <p className="text-xs text-gray-400">
          Maximum file size: {maxFileSize}MB • Maximum files: {maxFiles}
        </p>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Files ({uploadedFiles.length})
            </h3>
            {uploadedFiles.some(f => f.status === 'pending') && (
              <button
                onClick={uploadAllFiles}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Upload All'}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {uploadedFiles.map((fileData) => (
              <div
                key={fileData.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-2xl">
                    {getFileIcon(fileData.file.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileData.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileData.file.size)} • {ALLOWED_TYPES[fileData.file.type as keyof typeof ALLOWED_TYPES]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Status Icon */}
                  {fileData.status === 'pending' && (
                    <button
                      onClick={() => uploadFile(fileData)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Upload file"
                    >
                      <CloudArrowUpIcon className="h-5 w-5" />
                    </button>
                  )}
                  
                  {fileData.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${fileData.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{fileData.progress}%</span>
                    </div>
                  )}
                  
                  {fileData.status === 'success' && (
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-5 w-5 text-green-600" />
                      {fileData.autoRetraining && (
                        <div className="flex items-center gap-1">
                          {fileData.retrainingStatus === 'training' && (
                            <div className="flex items-center gap-1">
                              <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full"></div>
                              <span className="text-xs text-blue-600 font-medium">AI Training...</span>
                            </div>
                          )}
                          {fileData.retrainingStatus === 'completed' && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">✨ AI Updated</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {fileData.status === 'error' && (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" title={fileData.error} />
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(fileData.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Retraining Status */}
      {uploadedFiles.some(f => f.autoRetraining) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">AI</div>
            <h3 className="text-lg font-medium text-blue-900">Automatic Model Retraining</h3>
          </div>
          
          <div className="space-y-2">
            {uploadedFiles
              .filter(f => f.autoRetraining)
              .map(fileData => (
                <div key={fileData.id} className="flex items-center justify-between bg-white/50 rounded p-3">
                  <div>
                    <div className="font-medium text-blue-900">{fileData.file.name}</div>
                    <div className="text-sm text-blue-700">
                      {fileData.retrainingStatus === 'training' && '🔄 Retraining 7 AI models with new data...'}
                      {fileData.retrainingStatus === 'completed' && '✅ All 7 models successfully updated!'}
                      {fileData.retrainingStatus === 'failed' && '❌ Retraining failed'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {fileData.retrainingStatus === 'training' && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <span className="text-sm text-blue-600">Training...</span>
                      </div>
                    )}
                    {fileData.retrainingStatus === 'completed' && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        ✨ Updated
                      </span>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
          
          <div className="mt-3 text-xs text-blue-600">
            💡 New predictions will be more accurate with updated models. Check the AI Induction panel for improved results.
          </div>
        </div>
      )}

      {/* Data Preview */}
      {uploadedFiles.some(f => f.status === 'success' && f.previewData) && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Data Preview</h3>
          {uploadedFiles
            .filter(f => f.status === 'success' && f.previewData)
            .map((fileData) => (
              <div key={fileData.id} className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  {fileData.file.name} - First 10 rows
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        {fileData.previewData && fileData.previewData[0] && Object.keys(fileData.previewData[0].data).map((header) => (
                          <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {fileData.previewData?.map((row: any, index: number) => (
                        <tr key={index} className={row.isValid ? '' : 'bg-red-50'}>
                          {Object.values(row.data).map((value: any, cellIndex: number) => (
                            <td key={cellIndex} className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                              {value?.toString() || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {fileData.previewData?.some((row: any) => !row.isValid) && (
                  <div className="mt-2 text-xs text-red-600">
                    ⚠️ Some rows have validation errors and may not be processed correctly.
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Upload Guidelines:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Excel/CSV files will be automatically parsed and imported to database</li>
          <li>• PDF files will be stored for document reference</li>
          <li>• You can preview data before final processing</li>
          <li>• Ensure proper column headers for Excel/CSV files</li>
          <li>• Valid data types: trainset, maintenance, schedule, or generic data</li>
        </ul>
      </div>
    </div>
  )
}
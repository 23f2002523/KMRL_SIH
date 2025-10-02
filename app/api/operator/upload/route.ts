import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import * as XLSX from 'xlsx'
import { createReadStream } from 'fs'
import csvParser from 'csv-parser'
import { trainDb } from '@/lib/db/train-db'
import { uploadedDocuments, documentDataRecords } from '@/lib/db/train-schema'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'kmrl-sih-2025-secret-key'

// Ensure uploads directory exists
async function ensureUploadsDir() {
  const uploadsDir = join(process.cwd(), 'uploads')
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
  }
  return uploadsDir
}

// Parse Excel file
async function parseExcelFile(filePath: string) {
  try {
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    if (jsonData.length === 0) {
      throw new Error('Excel file is empty')
    }

    // First row as headers
    const headers = jsonData[0] as string[]
    const rows = jsonData.slice(1)
    
    const parsedData = rows.map((row: unknown, index) => {
      const rowArray = row as any[]
      const rowData: Record<string, any> = {}
      headers.forEach((header, colIndex) => {
        rowData[header] = rowArray[colIndex] || null
      })
      return {
        rowIndex: index + 2, // +2 because we start from row 2 (after header)
        data: rowData
      }
    })

    return {
      headers,
      data: parsedData,
      totalRows: parsedData.length
    }
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Parse CSV file
async function parseCSVFile(filePath: string): Promise<{
  headers: string[]
  data: Array<{ rowIndex: number; data: Record<string, any> }>
  totalRows: number
}> {
  return new Promise((resolve, reject) => {
    const results: Array<{ rowIndex: number; data: Record<string, any> }> = []
    let headers: string[] = []
    let rowIndex = 2 // Start from 2 (after header row)

    createReadStream(filePath)
      .pipe(csvParser({ headers: true }))
      .on('headers', (headerList: string[]) => {
        headers = headerList
      })
      .on('data', (data: Record<string, any>) => {
        results.push({
          rowIndex,
          data
        })
        rowIndex++
      })
      .on('end', () => {
        resolve({
          headers,
          data: results,
          totalRows: results.length
        })
      })
      .on('error', (error: any) => {
        reject(new Error(`Failed to parse CSV file: ${error.message}`))
      })
  })
}

// Determine data type based on headers
function determineDataType(headers: string[]): string {
  const headerStr = headers.join(',').toLowerCase()
  
  if (headerStr.includes('trainset') || headerStr.includes('serial')) {
    return 'trainset'
  } else if (headerStr.includes('maintenance') || headerStr.includes('job') || headerStr.includes('repair')) {
    return 'maintenance'
  } else if (headerStr.includes('schedule') || headerStr.includes('time') || headerStr.includes('departure')) {
    return 'schedule'
  } else {
    return 'generic'
  }
}

// Validate row data
function validateRowData(data: Record<string, any>, dataType: string) {
  const errors: string[] = []
  
  // Basic validation
  const hasData = Object.values(data).some(value => value !== null && value !== undefined && value !== '')
  if (!hasData) {
    errors.push('Empty row')
  }

  // Type-specific validation
  if (dataType === 'trainset') {
    if (!data['Serial No'] && !data['serial_no'] && !data['trainset_id']) {
      errors.push('Missing trainset identifier')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token - check both cookies and Authorization header
    let token = request.cookies.get('token')?.value
    
    if (!token) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      console.log('No token found in cookies or Authorization header')
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
    }

    let userId: number
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
      userId = decoded.userId
      console.log('Token verified, userId:', userId)
    } catch (error) {
      console.log('Token verification failed:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/pdf'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only Excel, CSV, and PDF files are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // Ensure uploads directory exists
    const uploadsDir = await ensureUploadsDir()
    
    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name
    const extension = originalName.split('.').pop()
    const fileName = `${timestamp}-${Math.random().toString(36).substr(2, 9)}.${extension}`
    const filePath = join(uploadsDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Determine file type
    const fileType = file.type.includes('pdf') ? 'pdf' : 
                    file.type.includes('csv') ? 'csv' : 'excel'

    // Insert document record
    const [documentRecord] = await trainDb.insert(uploadedDocuments).values({
      fileName,
      originalName,
      fileType,
      mimeType: file.type,
      fileSize: file.size,
      filePath,
      uploadedBy: userId,
      processingStatus: 'pending'
    }).returning()

    let previewData: any[] = []
    let totalRows = 0

    // Process Excel/CSV files
    if (fileType !== 'pdf') {
      try {
        // Update status to processing
        await trainDb.update(uploadedDocuments)
          .set({ processingStatus: 'processing' })

        let parsedResult
        if (fileType === 'excel') {
          parsedResult = await parseExcelFile(filePath)
        } else {
          parsedResult = await parseCSVFile(filePath)
        }

        const { headers, data } = parsedResult
        totalRows = data.length
        
        // Determine data type
        const dataType = determineDataType(headers)

        // Store parsed data (limit to first 100 rows for preview)
        const previewLimit = Math.min(data.length, 100)
        const dataRecords = []

        for (let i = 0; i < data.length; i++) {
          const row = data[i] as { rowIndex: number; data: Record<string, any> }
          const validation = validateRowData(row.data, dataType)
          
          dataRecords.push({
            documentId: documentRecord.documentId,
            rowIndex: row.rowIndex,
            columnData: JSON.stringify(row.data),
            dataType,
            isValid: validation.isValid,
            validationErrors: validation.errors.length > 0 ? JSON.stringify(validation.errors) : null
          })

          // Add to preview data (first 10 rows)
          if (i < 10) {
            previewData.push({
              rowIndex: row.rowIndex,
              data: row.data,
              isValid: validation.isValid,
              errors: validation.errors
            })
          }
        }

        // Insert all data records in batch
        if (dataRecords.length > 0) {
          await trainDb.insert(documentDataRecords).values(dataRecords)
        }

        // Update document status
        await trainDb.update(uploadedDocuments)
          .set({ 
            processingStatus: 'completed',
            recordsProcessed: totalRows
          })

      } catch (error) {
        // Update status to failed
        await trainDb.update(uploadedDocuments)
          .set({ 
            processingStatus: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Processing failed'
          })

        throw error
      }
    } else {
      // For PDF files, just mark as completed
      await trainDb.update(uploadedDocuments)
        .set({ processingStatus: 'completed' })
    }

    return NextResponse.json({
      success: true,
      document: {
        id: documentRecord.documentId,
        fileName: originalName,
        fileType,
        fileSize: file.size,
        status: 'completed'
      },
      previewData: previewData.length > 0 ? previewData : null,
      totalRows: totalRows,
      message: fileType === 'pdf' 
        ? 'PDF file uploaded successfully' 
        : `File processed successfully. ${totalRows} rows imported.`
    })

  } catch (error) {
    console.error('Upload error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
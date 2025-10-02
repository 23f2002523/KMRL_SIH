import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import * as XLSX from 'xlsx'
import { createReadStream } from 'fs'
import csvParser from 'csv-parser'
import { trainDb } from '@/lib/db/train-db'
import { uploadedDocuments, documentDataRecords } from '@/lib/db/train-schema'
import { determineDataType, processRecords, generateProcessingSummary } from '@/lib/data-cleaning'
import { insertCleanedData, validateTrainIds } from '@/lib/db-insertion'
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

    // Convert to consistent format
    const rows = jsonData.map((row: unknown, index) => {
      const rowArray = row as any[]
      const rowData: Record<string, any> = {}
      rowArray.forEach((cell, colIndex) => {
        rowData[`_${colIndex}`] = cell || null
      })
      return {
        rowIndex: index + 1,
        data: rowData
      }
    })

    return {
      data: rows,
      totalRows: rows.length
    }
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Parse CSV file
async function parseCSVFile(filePath: string): Promise<{
  data: Array<{ rowIndex: number; data: Record<string, any> }>
  totalRows: number
}> {
  return new Promise((resolve, reject) => {
    const results: Array<{ rowIndex: number; data: Record<string, any> }> = []
    let rowIndex = 1

    createReadStream(filePath)
      .pipe(csvParser({ headers: false }))
      .on('data', (data: Record<string, any>) => {
        // Convert to consistent _0, _1, _2 format
        const convertedData: Record<string, any> = {}
        Object.keys(data).forEach((key, index) => {
          convertedData[`_${index}`] = data[key]
        })
        
        results.push({
          rowIndex,
          data: convertedData
        })
        rowIndex++
      })
      .on('end', () => {
        resolve({
          data: results,
          totalRows: results.length
        })
      })
      .on('error', (error: any) => {
        reject(new Error(`Failed to parse CSV file: ${error.message}`))
      })
  })
}

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
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
    const processData = formData.get('processData') === 'true' // Optional flag to process data
    
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
    let processingSummary: any = null
    let insertionResult: any = null

    // Process Excel/CSV files
    if (fileType !== 'pdf') {
      try {
        // Update status to processing
        await trainDb.update(uploadedDocuments)
          .set({ processingStatus: 'processing' })
          .where({ documentId: documentRecord.documentId })

        let parsedResult
        if (fileType === 'excel') {
          parsedResult = await parseExcelFile(filePath)
        } else {
          parsedResult = await parseCSVFile(filePath)
        }

        const { data } = parsedResult
        totalRows = data.length
        
        // Determine data type from content
        const rawRecords = data.map(item => item.data)
        const dataType = determineDataType(rawRecords)
        
        console.log(`Detected data type: ${dataType} for file: ${originalName}`)

        // Clean and process the data
        const cleanedRecords = processRecords(rawRecords, dataType)
        processingSummary = generateProcessingSummary(cleanedRecords)
        
        console.log('Processing summary:', processingSummary)

        // Store raw parsed data in document_data_records
        const dataRecords = cleanedRecords.map((record, index) => ({
          documentId: documentRecord.documentId,
          rowIndex: index + 2, // +2 to account for header row
          columnData: JSON.stringify(record.original),
          dataType,
          isValid: record.isValid,
          validationErrors: record.errors.length > 0 ? JSON.stringify(record.errors) : null
        }))

        if (dataRecords.length > 0) {
          await trainDb.insert(documentDataRecords).values(dataRecords)
        }

        // Create preview data (first 10 rows)
        previewData = cleanedRecords.slice(0, 10).map((record, index) => ({
          rowIndex: index + 2,
          original: record.original,
          cleaned: record.cleaned,
          isValid: record.isValid,
          errors: record.errors
        }))

        // If processData flag is true and data type is recognized, insert into main tables
        if (processData && (dataType === 'maintenance' || dataType === 'trainset')) {
          console.log(`Processing ${dataType} data into main database tables...`)
          
          insertionResult = await insertCleanedData(cleanedRecords, dataType)
          console.log('Insertion result:', insertionResult)
        }

        // Update document status
        await trainDb.update(uploadedDocuments)
          .set({ 
            processingStatus: 'completed',
            recordsProcessed: totalRows
          })
          .where({ documentId: documentRecord.documentId })

      } catch (error) {
        console.error('Processing error:', error)
        
        // Update status to failed
        await trainDb.update(uploadedDocuments)
          .set({ 
            processingStatus: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Processing failed'
          })
          .where({ documentId: documentRecord.documentId })

        throw error
      }
    } else {
      // For PDF files, just mark as completed
      await trainDb.update(uploadedDocuments)
        .set({ processingStatus: 'completed' })
        .where({ documentId: documentRecord.documentId })
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
      totalRows,
      processingSummary,
      insertionResult,
      message: fileType === 'pdf' 
        ? 'PDF file uploaded successfully' 
        : `File processed successfully. ${totalRows} rows parsed. ${processingSummary?.validRecords || 0} valid records.`
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
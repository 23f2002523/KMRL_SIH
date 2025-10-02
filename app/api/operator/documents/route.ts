import { NextRequest, NextResponse } from 'next/server'
import { trainDb } from '@/lib/db/train-db'
import { uploadedDocuments, documentDataRecords, trainUsers } from '@/lib/db/train-schema'
import { eq, desc } from 'drizzle-orm'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'kmrl-sih-2025-secret-key'

export async function GET(request: NextRequest) {
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

    try {
      jwt.verify(token, JWT_SECRET)
      console.log('Token verified successfully for documents API')
    } catch (error) {
      console.log('Token verification failed for documents API:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get all uploaded documents with user info
    const documents = await trainDb
      .select({
        documentId: uploadedDocuments.documentId,
        fileName: uploadedDocuments.originalName,
        fileType: uploadedDocuments.fileType,
        fileSize: uploadedDocuments.fileSize,
        processingStatus: uploadedDocuments.processingStatus,
        recordsProcessed: uploadedDocuments.recordsProcessed,
        errorMessage: uploadedDocuments.errorMessage,
        createdAt: uploadedDocuments.createdAt,
        uploadedBy: trainUsers.name
      })
      .from(uploadedDocuments)
      .leftJoin(trainUsers, eq(uploadedDocuments.uploadedBy, trainUsers.userId))
      .orderBy(desc(uploadedDocuments.createdAt))
      .limit(50)

    return NextResponse.json({
      success: true,
      documents
    })

  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json({
      error: 'Failed to fetch documents',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
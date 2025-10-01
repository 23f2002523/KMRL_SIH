import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { documents, users, documentAnalytics } from "@/lib/db/schema"
import { eq, like, and } from "drizzle-orm"

// GET /api/documents - Retrieve documents with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const trainset = searchParams.get("trainset") // For trainset-specific documents

    // Build base query
    let documentsResult;

    if (status || category || search || trainset) {
      // Apply filters
      const conditions = []
      if (status) conditions.push(eq(documents.status, status as any))
      if (category) conditions.push(eq(documents.category, category))
      if (search) conditions.push(like(documents.title, `%${search}%`))
      if (trainset) {
        // Search for trainset-related documents
        conditions.push(like(documents.title, `%${trainset}%`))
      }

      documentsResult = await db
        .select()
        .from(documents)
        .where(and(...conditions))
    } else {
      // No filters - get all documents
      documentsResult = await db.select().from(documents)
    }

    // Get uploader details for each document
    const documentsWithUploaders = await Promise.all(
      documentsResult.map(async (doc) => {
        const uploader = doc.uploadedBy
          ? await db.select().from(users).where(eq(users.id, doc.uploadedBy)).limit(1)
          : null

        return {
          ...doc,
          uploader: uploader?.[0] ? {
            id: uploader[0].id,
            name: uploader[0].name,
            email: uploader[0].email,
          } : null
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: documentsWithUploaders,
      count: documentsWithUploaders.length,
    })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch documents" }, { status: 500 })
  }
}

// POST /api/documents - Create a new document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["title", "filePath", "fileName", "fileSize", "mimeType", "uploadedBy"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create document
    const newDocument = await db.insert(documents).values({
      title: body.title,
      description: body.description || null,
      filePath: body.filePath,
      fileName: body.fileName,
      fileSize: body.fileSize,
      mimeType: body.mimeType,
      category: body.category || null,
      tags: body.tags ? JSON.stringify(body.tags) : null,
      uploadedBy: body.uploadedBy,
      status: "active",
    }).returning()

    // Log the upload action
    if (newDocument[0] && body.uploadedBy) {
      await db.insert(documentAnalytics).values({
        documentId: newDocument[0].id,
        userId: body.uploadedBy,
        action: "view", // Use allowed enum value
        metadata: JSON.stringify({ fileName: body.fileName, category: body.category }),
      })
    }

    return NextResponse.json(
      {
        success: true,
        data: newDocument[0],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating document:", error)
    return NextResponse.json({ success: false, error: "Failed to create document" }, { status: 500 })
  }
}

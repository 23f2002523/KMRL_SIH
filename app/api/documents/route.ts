import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

// GET /api/documents - Retrieve documents with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const department_id = searchParams.get("department_id")
    const category_id = searchParams.get("category_id")
    const user_id = searchParams.get("user_id")

    const filters = {
      ...(status && { status }),
      ...(department_id && { department_id }),
      ...(category_id && { category_id }),
      ...(user_id && { user_id }),
    }

    const documents = await DatabaseService.getDocuments(filters)

    return NextResponse.json({
      success: true,
      data: documents,
      count: documents.length,
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
    const requiredFields = ["title", "file_path", "file_name", "source_type", "uploaded_by"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const document = await DatabaseService.createDocument({
      title: body.title,
      malayalam_title: body.malayalam_title,
      description: body.description,
      malayalam_description: body.malayalam_description,
      file_path: body.file_path,
      file_name: body.file_name,
      file_size: body.file_size,
      mime_type: body.mime_type,
      language: body.language || "en",
      source_type: body.source_type,
      source_metadata: body.source_metadata,
      category_id: body.category_id,
      department_id: body.department_id,
      uploaded_by: body.uploaded_by,
      status: "pending",
      priority: body.priority || "medium",
      due_date: body.due_date,
    })

    // Create audit log
    await DatabaseService.createAuditLog({
      user_id: body.uploaded_by,
      document_id: document.id,
      action: "document_created",
      details: { source_type: body.source_type, file_name: body.file_name },
    })

    return NextResponse.json(
      {
        success: true,
        data: document,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating document:", error)
    return NextResponse.json({ success: false, error: "Failed to create document" }, { status: 500 })
  }
}

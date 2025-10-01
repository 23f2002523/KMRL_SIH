import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

// GET /api/documents/[id] - Get a specific document
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const document = await DatabaseService.getDocumentById(params.id)

    if (!document) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: document,
    })
  } catch (error) {
    console.error("Error fetching document:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch document" }, { status: 500 })
  }
}

// PATCH /api/documents/[id] - Update document status
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status, user_id } = body

    if (!status) {
      return NextResponse.json({ success: false, error: "Status is required" }, { status: 400 })
    }

    await DatabaseService.updateDocumentStatus(params.id, status)

    // Create audit log
    if (user_id) {
      await DatabaseService.createAuditLog({
        user_id,
        document_id: params.id,
        action: "document_status_updated",
        details: { new_status: status },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Document status updated successfully",
    })
  } catch (error) {
    console.error("Error updating document:", error)
    return NextResponse.json({ success: false, error: "Failed to update document" }, { status: 500 })
  }
}

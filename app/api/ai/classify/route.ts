import { type NextRequest, NextResponse } from "next/server"
import { aiServices } from "@/lib/ai-services"

// POST /api/ai/classify - Auto-classify documents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, title, document_id } = body

    if (!text && !title) {
      return NextResponse.json({ success: false, error: "Either text or title is required" }, { status: 400 })
    }

    const classificationResult = await aiServices.classifyDocument(text, title)

    return NextResponse.json({
      success: true,
      data: classificationResult,
    })
  } catch (error) {
    console.error("Error in document classification:", error)
    return NextResponse.json({ success: false, error: "Classification failed" }, { status: 500 })
  }
}

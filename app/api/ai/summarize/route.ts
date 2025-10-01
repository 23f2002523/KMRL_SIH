import { type NextRequest, NextResponse } from "next/server"
import { aiServices } from "@/lib/ai-services"

// POST /api/ai/summarize - AI document summarization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, language = "en", document_id } = body

    if (!text) {
      return NextResponse.json({ success: false, error: "Text content is required" }, { status: 400 })
    }

    const summaryResult = await aiServices.generateSummary(text, language)

    return NextResponse.json({
      success: true,
      data: summaryResult,
    })
  } catch (error) {
    console.error("Error in AI summarization:", error)
    return NextResponse.json({ success: false, error: "Summarization failed" }, { status: 500 })
  }
}

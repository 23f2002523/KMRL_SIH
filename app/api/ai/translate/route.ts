import { type NextRequest, NextResponse } from "next/server"
import { aiServices } from "@/lib/ai-services"

// POST /api/ai/translate - Bidirectional EN↔ML translation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, from_language, to_language } = body

    if (!text || !from_language || !to_language) {
      return NextResponse.json(
        { success: false, error: "Text, from_language, and to_language are required" },
        { status: 400 },
      )
    }

    const translationResult = await aiServices.translateText(text, from_language, to_language)

    return NextResponse.json({
      success: true,
      data: translationResult,
    })
  } catch (error) {
    console.error("Error in translation:", error)
    return NextResponse.json({ success: false, error: "Translation failed" }, { status: 500 })
  }
}

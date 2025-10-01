import { type NextRequest, NextResponse } from "next/server"
import { aiServices } from "@/lib/ai-services"

// POST /api/ai/ocr - OCR text extraction from images
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image_data, language = "auto", document_id } = body

    if (!image_data) {
      return NextResponse.json({ success: false, error: "Image data is required" }, { status: 400 })
    }

    const ocrResult = await aiServices.performOCR(image_data, language)

    return NextResponse.json({
      success: true,
      data: ocrResult,
    })
  } catch (error) {
    console.error("Error in OCR processing:", error)
    return NextResponse.json({ success: false, error: "OCR processing failed" }, { status: 500 })
  }
}

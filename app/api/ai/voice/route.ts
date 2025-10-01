import { type NextRequest, NextResponse } from "next/server"
import { aiServices } from "@/lib/ai-services"

// POST /api/ai/voice - Voice query processing
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const language = (formData.get("language") as string) || "en"

    if (!audioFile) {
      return NextResponse.json({ success: false, error: "Audio file is required" }, { status: 400 })
    }

    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type })
    const voiceResult = await aiServices.processVoiceQuery(audioBlob, language as "en" | "ml")

    return NextResponse.json({
      success: true,
      data: voiceResult,
    })
  } catch (error) {
    console.error("Error in voice processing:", error)
    return NextResponse.json({ success: false, error: "Voice processing failed" }, { status: 500 })
  }
}

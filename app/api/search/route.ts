import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

// GET /api/search - Search documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const language = (searchParams.get("lang") as "en" | "ml") || "en"

    if (!query) {
      return NextResponse.json({ success: false, error: "Search query is required" }, { status: 400 })
    }

    const documents = await DatabaseService.searchDocuments(query, language)

    return NextResponse.json({
      success: true,
      data: documents,
      count: documents.length,
      query,
      language,
    })
  } catch (error) {
    console.error("Error searching documents:", error)
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 })
  }
}

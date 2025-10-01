import { type NextRequest, NextResponse } from "next/server"
import { aiServices } from "@/lib/ai-services"
import { DatabaseService } from "@/lib/database"

// GET /api/ai/knowledge-graph - Generate knowledge graph from documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department_id = searchParams.get("department_id")
    const category_id = searchParams.get("category_id")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Get documents for knowledge graph generation
    const documents = await DatabaseService.getDocuments({
      ...(department_id && { department_id }),
      ...(category_id && { category_id }),
    })

    const limitedDocs = documents.slice(0, limit).map((doc) => ({
      id: doc.id,
      title: doc.title,
      content: doc.description || doc.title,
    }))

    const knowledgeGraph = await aiServices.generateKnowledgeGraph(limitedDocs)

    return NextResponse.json({
      success: true,
      data: knowledgeGraph,
      document_count: limitedDocs.length,
    })
  } catch (error) {
    console.error("Error generating knowledge graph:", error)
    return NextResponse.json({ success: false, error: "Knowledge graph generation failed" }, { status: 500 })
  }
}

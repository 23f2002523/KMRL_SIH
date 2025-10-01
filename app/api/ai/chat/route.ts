import { type NextRequest, NextResponse } from "next/server"
import { aiServices } from "@/lib/ai-services"
import { DatabaseService } from "@/lib/database"

// POST /api/ai/chat - AI chatbot for document Q&A
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, language = "en", document_ids = [] } = body

    if (!query) {
      return NextResponse.json({ success: false, error: "Query is required" }, { status: 400 })
    }

    // Get relevant document context
    let documentContext: string[] = []

    if (document_ids.length > 0) {
      // Fetch specific documents
      for (const docId of document_ids) {
        const document = await DatabaseService.getDocumentById(docId)
        if (document) {
          const title = language === "ml" && document.malayalam_title ? document.malayalam_title : document.title
          const description =
            language === "ml" && document.malayalam_description
              ? document.malayalam_description
              : document.description || ""

          documentContext.push(`${title}\n${description}`)
        }
      }
    } else {
      // Search for relevant documents based on query
      const searchResults = await DatabaseService.searchDocuments(query, language)
      documentContext = searchResults.slice(0, 3).map((doc) => {
        const title = language === "ml" && doc.malayalam_title ? doc.malayalam_title : doc.title
        const description =
          language === "ml" && doc.malayalam_description ? doc.malayalam_description : doc.description || ""

        return `${title}\n${description}`
      })
    }

    const chatResponse = await aiServices.chatWithDocuments(query, documentContext, language)

    return NextResponse.json({
      success: true,
      data: chatResponse,
    })
  } catch (error) {
    console.error("Error in AI chat:", error)
    return NextResponse.json({ success: false, error: "AI chat failed" }, { status: 500 })
  }
}

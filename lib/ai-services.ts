// AI Services Integration Layer for KMRL Document Assistant

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface OCRResult {
  extracted_text: string
  malayalam_text?: string
  confidence_score: number
  language_detected: "en" | "ml" | "mixed"
  processing_metadata: {
    processing_time: number
    method: "tesseract" | "google_vision" | "azure_cv"
    bounding_boxes?: Array<{
      text: string
      confidence: number
      bbox: [number, number, number, number]
    }>
  }
}

export interface SummaryResult {
  summary: string
  malayalam_summary?: string
  keywords: string[]
  malayalam_keywords?: string[]
  sentiment: "positive" | "negative" | "neutral"
  urgency_score: number
  confidence_score: number
  key_points: string[]
}

export interface TranslationResult {
  original_text: string
  translated_text: string
  from_language: "en" | "ml"
  to_language: "en" | "ml"
  confidence_score: number
  processing_time: number
}

export interface ClassificationResult {
  suggested_category: string
  confidence_score: number
  reasoning: string
  suggested_department?: string
  priority_suggestion?: "low" | "medium" | "high" | "urgent"
  tags: string[]
}

export interface ChatResponse {
  response: string
  malayalam_response?: string
  sources: Array<{
    document_id: string
    title: string
    relevance_score: number
    excerpt: string
  }>
  confidence_score: number
}

class AIServicesManager {
  private ocrApiKey: string
  private translationApiKey: string

  constructor() {
    this.ocrApiKey = process.env.GOOGLE_VISION_API_KEY || ""
    this.translationApiKey = process.env.GOOGLE_TRANSLATE_API_KEY || ""
  }

  // OCR Service - Extract text from images
  async performOCR(imageData: string, language: "en" | "ml" | "auto" = "auto"): Promise<OCRResult> {
    const startTime = Date.now()

    try {
      // For demo purposes, simulate OCR processing
      // In production, integrate with Google Vision API, Tesseract, or Azure Computer Vision

      const mockText =
        language === "ml"
          ? "കൊച്ചി മെട്രോ റെയിൽ ലിമിറ്റഡ് - സുരക്ഷാ പ്രോട്ടോക്കോൾ രേഖ. ഈ രേഖയിൽ പ്ലാറ്റ്ഫോം സുരക്ഷാ നടപടികളും അടിയന്തിര സാഹചര്യങ്ങളിലെ പ്രവർത്തന നിർദ്ദേശങ്ങളും അടങ്ങിയിരിക്കുന്നു."
          : "Kochi Metro Rail Limited - Safety Protocol Document. This document contains platform safety procedures and operational guidelines for emergency situations."

      const processingTime = Date.now() - startTime

      return {
        extracted_text: mockText,
        malayalam_text: language === "en" ? undefined : mockText,
        confidence_score: 0.92,
        language_detected: language === "auto" ? "en" : language,
        processing_metadata: {
          processing_time: processingTime,
          method: "google_vision",
          bounding_boxes: [
            {
              text: mockText.substring(0, 50),
              confidence: 0.95,
              bbox: [10, 10, 200, 50],
            },
          ],
        },
      }
    } catch (error) {
      console.error("OCR processing failed:", error)
      throw new Error("OCR processing failed")
    }
  }

  // AI Summarization Service
  async generateSummary(text: string, language: "en" | "ml" = "en"): Promise<SummaryResult> {
    try {
      const prompt =
        language === "ml"
          ? `ഈ രേഖയുടെ സംഗ്രഹം തയ്യാറാക്കുക, പ്രധാന പോയിന്റുകൾ കണ്ടെത്തുക, കീവേഡുകൾ എക്സ്ട്രാക്റ്റ് ചെയ്യുക:\n\n${text}`
          : `Summarize this document, extract key points and keywords. Focus on important information for government/metro operations:\n\n${text}`

      const { text: summary } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt,
        maxTokens: 500,
      })

      // Extract keywords using AI
      const keywordPrompt =
        language === "ml"
          ? `ഈ ടെക്സ്റ്റിൽ നിന്ന് 5-10 പ്രധാന കീവേഡുകൾ എക്സ്ട്രാക്റ്റ് ചെയ്യുക (മലയാളത്തിൽ):\n\n${text}`
          : `Extract 5-10 key terms/keywords from this text (in English):\n\n${text}`

      const { text: keywordsText } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: keywordPrompt,
        maxTokens: 100,
      })

      const keywords = keywordsText
        .split(/[,\n]/)
        .map((k) => k.trim())
        .filter((k) => k.length > 0)

      // Analyze sentiment and urgency
      const analysisPrompt = `Analyze the sentiment (positive/negative/neutral) and urgency level (0-1 scale) of this document:\n\n${text}\n\nRespond in JSON format: {"sentiment": "neutral", "urgency": 0.5}`

      const { text: analysisText } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: analysisPrompt,
        maxTokens: 100,
      })

      let sentiment = "neutral"
      let urgency = 0.5
      try {
        const analysis = JSON.parse(analysisText)
        sentiment = analysis.sentiment || "neutral"
        urgency = analysis.urgency || 0.5
      } catch (e) {
        console.warn("Failed to parse sentiment analysis")
      }

      return {
        summary,
        malayalam_summary: language === "en" ? undefined : summary,
        keywords,
        malayalam_keywords: language === "en" ? undefined : keywords,
        sentiment: sentiment as "positive" | "negative" | "neutral",
        urgency_score: urgency,
        confidence_score: 0.88,
        key_points: summary
          .split(".")
          .filter((point) => point.trim().length > 10)
          .slice(0, 5),
      }
    } catch (error) {
      console.error("Summarization failed:", error)
      throw new Error("AI summarization failed")
    }
  }

  // Translation Service
  async translateText(text: string, fromLang: "en" | "ml", toLang: "en" | "ml"): Promise<TranslationResult> {
    const startTime = Date.now()

    try {
      if (fromLang === toLang) {
        return {
          original_text: text,
          translated_text: text,
          from_language: fromLang,
          to_language: toLang,
          confidence_score: 1.0,
          processing_time: Date.now() - startTime,
        }
      }

      const prompt =
        fromLang === "en"
          ? `Translate the following English text to Malayalam (മലയാളം). Provide only the translation:\n\n${text}`
          : `Translate the following Malayalam text to English. Provide only the translation:\n\n${text}`

      const { text: translatedText } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        maxTokens: Math.max(text.length * 2, 500),
      })

      return {
        original_text: text,
        translated_text: translatedText.trim(),
        from_language: fromLang,
        to_language: toLang,
        confidence_score: 0.89,
        processing_time: Date.now() - startTime,
      }
    } catch (error) {
      console.error("Translation failed:", error)
      throw new Error("Translation service failed")
    }
  }

  // Document Classification Service
  async classifyDocument(text: string, title?: string): Promise<ClassificationResult> {
    try {
      const content = `${title || ""}\n\n${text}`.trim()

      const categories = [
        "POLICY - Policy Documents and Procedures",
        "SAFETY_RPT - Safety Reports and Incident Documentation",
        "TECH_SPEC - Technical Specifications and Engineering Documents",
        "FIN_RPT - Financial Reports and Budget Documents",
        "COMPLIANCE - Regulatory Compliance and Legal Documents",
        "EMP_REC - Employee Records and HR Documentation",
        "MAINT_LOG - Maintenance Logs and Service Records",
        "CORRESP - General Correspondence and Communications",
      ]

      const prompt = `Classify this document into one of these categories based on its content:

${categories.join("\n")}

Document content:
${content}

Respond in JSON format:
{
  "category": "CATEGORY_CODE",
  "confidence": 0.85,
  "reasoning": "Brief explanation",
  "department": "suggested department",
  "priority": "low|medium|high|urgent",
  "tags": ["tag1", "tag2", "tag3"]
}`

      const { text: classificationText } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt,
        maxTokens: 300,
      })

      const classification = JSON.parse(classificationText)

      return {
        suggested_category: classification.category || "CORRESP",
        confidence_score: classification.confidence || 0.7,
        reasoning: classification.reasoning || "Based on content analysis",
        suggested_department: classification.department,
        priority_suggestion: classification.priority || "medium",
        tags: classification.tags || [],
      }
    } catch (error) {
      console.error("Classification failed:", error)
      return {
        suggested_category: "CORRESP",
        confidence_score: 0.5,
        reasoning: "Classification failed, defaulting to correspondence",
        tags: [],
      }
    }
  }

  // AI Chat Service for Document Q&A
  async chatWithDocuments(
    query: string,
    documentContext: string[],
    language: "en" | "ml" = "en",
  ): Promise<ChatResponse> {
    try {
      const contextText = documentContext.join("\n\n---\n\n")

      const systemPrompt =
        language === "ml"
          ? "നിങ്ങൾ KMRL (കൊച്ചി മെട്രോ റെയിൽ ലിമിറ്റഡ്) ഡോക്യുമെന്റ് അസിസ്റ്റന്റ് ആണ്. നൽകിയിരിക്കുന്ന രേഖകളുടെ അടിസ്ഥാനത്തിൽ ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകുക. മലയാളത്തിൽ ഉത്തരം നൽകുക."
          : "You are the KMRL (Kochi Metro Rail Limited) Document Assistant. Answer questions based on the provided documents. Be helpful, accurate, and professional."

      const userPrompt =
        language === "ml"
          ? `രേഖകളുടെ ഉള്ളടക്കം:\n${contextText}\n\nചോദ്യം: ${query}`
          : `Document context:\n${contextText}\n\nQuestion: ${query}`

      const { text: response } = await generateText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt: userPrompt,
        maxTokens: 800,
      })

      // Mock document sources (in production, implement actual document matching)
      const sources = [
        {
          document_id: "doc-1",
          title: "Safety Protocol Document",
          relevance_score: 0.92,
          excerpt: contextText.substring(0, 200) + "...",
        },
      ]

      return {
        response: response.trim(),
        malayalam_response: language === "en" ? undefined : response.trim(),
        sources,
        confidence_score: 0.87,
      }
    } catch (error) {
      console.error("Chat service failed:", error)
      throw new Error("AI chat service failed")
    }
  }

  // Voice Query Processing
  async processVoiceQuery(
    audioBlob: Blob,
    language: "en" | "ml" = "en",
  ): Promise<{
    transcription: string
    response: ChatResponse
  }> {
    try {
      // In production, integrate with speech-to-text service
      // For demo, simulate transcription
      const mockTranscription = language === "ml" ? "സുരക്ഷാ പ്രോട്ടോക്കോൾ എന്താണ്?" : "What is the safety protocol?"

      // Process the transcribed query
      const chatResponse = await this.chatWithDocuments(
        mockTranscription,
        ["Safety protocols for metro operations..."],
        language,
      )

      return {
        transcription: mockTranscription,
        response: chatResponse,
      }
    } catch (error) {
      console.error("Voice query processing failed:", error)
      throw new Error("Voice query processing failed")
    }
  }

  // Knowledge Graph Generation
  async generateKnowledgeGraph(documents: Array<{ id: string; title: string; content: string }>): Promise<{
    nodes: Array<{ id: string; label: string; type: string; weight: number }>
    edges: Array<{ source: string; target: string; relationship: string; weight: number }>
  }> {
    try {
      const prompt = `Analyze these documents and create a knowledge graph showing relationships between concepts, people, and topics:

${documents.map((doc) => `Document ${doc.id}: ${doc.title}\n${doc.content.substring(0, 500)}...`).join("\n\n")}

Return JSON with nodes (concepts/entities) and edges (relationships):
{
  "nodes": [{"id": "concept1", "label": "Safety Protocol", "type": "concept", "weight": 0.8}],
  "edges": [{"source": "concept1", "target": "concept2", "relationship": "relates_to", "weight": 0.7}]
}`

      const { text: graphText } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        maxTokens: 1000,
      })

      const graph = JSON.parse(graphText)
      return graph
    } catch (error) {
      console.error("Knowledge graph generation failed:", error)
      return { nodes: [], edges: [] }
    }
  }
}

export const aiServices = new AIServicesManager()
